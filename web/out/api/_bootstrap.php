<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Allow: GET, POST, OPTIONS');
    http_response_code(204);
    exit;
}

function respond_json(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function respond_error(string $message, int $status = 400): never
{
    respond_json([
        'success' => false,
        'error' => $message,
    ], $status);
}

function require_method(string $method): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        respond_error('Method not allowed.', 405);
    }
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        respond_error('Request body is required.');
    }

    try {
        $payload = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
        respond_error('Invalid JSON body.');
    }

    if (!is_array($payload)) {
        respond_error('JSON body must decode to an object.');
    }

    return $payload;
}

function get_database_config(): array
{
    $configPath = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'siteground-config' . DIRECTORY_SEPARATOR . 'database.php';

    if (is_file($configPath)) {
        $config = require $configPath;
        if (is_array($config)) {
            return $config;
        }
    }

    $dsn = getenv('NAIERM_MYSQL_DSN') ?: '';
    $username = getenv('NAIERM_MYSQL_USERNAME') ?: '';
    $password = getenv('NAIERM_MYSQL_PASSWORD') ?: '';

    if ($dsn !== '' && $username !== '') {
        return [
            'dsn' => $dsn,
            'username' => $username,
            'password' => $password,
        ];
    }

    respond_error('Database configuration is missing. Add /siteground-config/database.php outside public_html.', 500);
}

function get_pdo(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = get_database_config();
    $dsn = is_string($config['dsn'] ?? null) ? $config['dsn'] : '';
    $username = is_string($config['username'] ?? null) ? $config['username'] : '';
    $password = is_string($config['password'] ?? null) ? $config['password'] : '';

    if ($dsn === '' || $username === '') {
        respond_error('Database configuration is incomplete.', 500);
    }

    try {
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $error) {
        respond_error('Database connection failed.', 500);
    }

    return $pdo;
}

function sanitize_optional_text(mixed $value, int $maxLength): ?string
{
    if (!is_string($value)) {
        return null;
    }

    $trimmed = trim(str_replace("\0", '', $value));
    if ($trimmed === '') {
        return null;
    }

    return mb_substr($trimmed, 0, $maxLength);
}

function sanitize_required_text(mixed $value, int $maxLength, string $fieldLabel): string
{
    $sanitized = sanitize_optional_text($value, $maxLength);
    if ($sanitized === null) {
        respond_error($fieldLabel . ' is required.');
    }

    return $sanitized;
}

function sanitize_optional_email(mixed $value): ?string
{
    $email = sanitize_optional_text($value, 254);
    if ($email === null) {
        return null;
    }

    $normalized = strtolower($email);
    if (!filter_var($normalized, FILTER_VALIDATE_EMAIL)) {
        respond_error('Please enter a valid email address or leave it blank.');
    }

    return $normalized;
}

function sanitize_demographics(mixed $value): ?array
{
    if (!is_array($value)) {
        return null;
    }

    $sanitized = [];
    $ageRange = sanitize_optional_text($value['ageRange'] ?? null, 40);
    $incomeLevel = sanitize_optional_text($value['incomeLevel'] ?? null, 60);
    $region = sanitize_optional_text($value['region'] ?? null, 80);
    $affiliation = sanitize_optional_text($value['affiliation'] ?? null, 80);

    if ($ageRange !== null) {
        $sanitized['ageRange'] = $ageRange;
    }
    if ($incomeLevel !== null) {
        $sanitized['incomeLevel'] = $incomeLevel;
    }
    if ($region !== null) {
        $sanitized['region'] = $region;
    }
    if ($affiliation !== null) {
        $sanitized['affiliation'] = $affiliation;
    }

    return $sanitized === [] ? null : $sanitized;
}

function is_honeypot_triggered(mixed $value): bool
{
    return is_string($value) && trim(str_replace("\0", '', $value)) !== '';
}

function as_array(mixed $value, string $fieldLabel): array
{
    if (!is_array($value)) {
        respond_error($fieldLabel . ' must be an object.');
    }

    return $value;
}

function as_number_or_null(mixed $value): ?float
{
    if (is_int($value) || is_float($value)) {
        return (float) $value;
    }

    if (is_string($value) && is_numeric($value)) {
        return (float) $value;
    }

    return null;
}

function as_string_or_null(mixed $value): ?string
{
    return is_string($value) ? $value : null;
}

function bool_from_mixed(mixed $value): bool
{
    if (is_bool($value)) {
        return $value;
    }

    if (is_int($value) || is_float($value)) {
        return (bool) $value;
    }

    if (is_string($value)) {
        $normalized = strtolower(trim($value));
        return in_array($normalized, ['1', 'true', 'yes'], true);
    }

    return false;
}

function require_number(mixed $value, string $fieldLabel): float
{
    $number = as_number_or_null($value);
    if ($number === null) {
        respond_error($fieldLabel . ' must be numeric.');
    }

    return $number;
}

function generate_identifier(): string
{
    $bytes = random_bytes(16);
    $hex = bin2hex($bytes);

    return sprintf(
        '%s-%s-%s-%s-%s',
        substr($hex, 0, 8),
        substr($hex, 8, 4),
        substr($hex, 12, 4),
        substr($hex, 16, 4),
        substr($hex, 20, 12)
    );
}

function json_stringify(mixed $value): string
{
    try {
        return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
        respond_error('Failed to encode JSON payload.', 500);
    }
}

function set_last_submission_cookie(string $submissionId): void
{
    setcookie('last_submission_id', $submissionId, [
        'expires' => time() + (60 * 60 * 24 * 365),
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => false,
        'samesite' => 'Lax',
    ]);
}
