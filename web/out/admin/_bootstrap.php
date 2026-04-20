<?php

declare(strict_types=1);

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

function admin_is_secure_request(): bool
{
    return !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
}

function admin_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    ini_set('session.use_strict_mode', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_secure', admin_is_secure_request() ? '1' : '0');
    ini_set('session.cookie_samesite', 'Strict');

    session_name('naierm_admin_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => admin_is_secure_request(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);

    session_start();
}

admin_start_session();

function admin_escape(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function admin_auth_config_path(): string
{
    return dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'siteground-config' . DIRECTORY_SEPARATOR . 'admin-auth.php';
}

function admin_database_config_path(): string
{
    return dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'siteground-config' . DIRECTORY_SEPARATOR . 'database.php';
}

function admin_get_auth_config(): array
{
    static $config = null;

    if (is_array($config)) {
        return $config;
    }

    $config = [];
    $path = admin_auth_config_path();

    if (is_file($path)) {
        $loaded = require $path;
        if (is_array($loaded)) {
            $config = $loaded;
        }
    }

    if ($config === []) {
        $envEmail = trim((string) (getenv('NAIERM_ADMIN_EMAIL') ?: ''));
        $envHash = trim((string) (getenv('NAIERM_ADMIN_PASSWORD_HASH') ?: ''));
        $envSecret = trim((string) (getenv('NAIERM_ADMIN_SESSION_SECRET') ?: ''));
        $envName = trim((string) (getenv('NAIERM_ADMIN_DISPLAY_NAME') ?: ''));

        if ($envEmail !== '' && $envHash !== '' && $envSecret !== '') {
            $config = [
                'session_secret' => $envSecret,
                'users' => [
                    [
                        'email' => strtolower($envEmail),
                        'password_hash' => $envHash,
                        'display_name' => $envName !== '' ? $envName : 'Admin',
                    ],
                ],
            ];
        }
    }

    $users = [];
    foreach ((array) ($config['users'] ?? []) as $user) {
        if (!is_array($user)) {
            continue;
        }

        $email = strtolower(trim((string) ($user['email'] ?? '')));
        $passwordHash = trim((string) ($user['password_hash'] ?? ''));
        $displayName = trim((string) ($user['display_name'] ?? ''));

        if ($email === '' || $passwordHash === '') {
            continue;
        }

        $users[] = [
            'email' => $email,
            'password_hash' => $passwordHash,
            'display_name' => $displayName !== '' ? $displayName : 'Admin',
        ];
    }

    return [
        'session_secret' => trim((string) ($config['session_secret'] ?? '')),
        'users' => $users,
    ];
}

function admin_is_auth_configured(): bool
{
    $config = admin_get_auth_config();
    return strlen($config['session_secret']) >= 32 && $config['users'] !== [];
}

function admin_get_database_config(): array
{
    $path = admin_database_config_path();

    if (is_file($path)) {
        $loaded = require $path;
        if (is_array($loaded)) {
            return $loaded;
        }
    }

    $dsn = trim((string) (getenv('NAIERM_MYSQL_DSN') ?: ''));
    $username = trim((string) (getenv('NAIERM_MYSQL_USERNAME') ?: ''));
    $password = (string) (getenv('NAIERM_MYSQL_PASSWORD') ?: '');

    if ($dsn !== '' && $username !== '') {
        return [
            'dsn' => $dsn,
            'username' => $username,
            'password' => $password,
        ];
    }

    throw new RuntimeException('Database configuration is missing. Add /siteground-config/database.php outside public_html.');
}

function admin_get_pdo(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = admin_get_database_config();
    $dsn = trim((string) ($config['dsn'] ?? ''));
    $username = trim((string) ($config['username'] ?? ''));
    $password = (string) ($config['password'] ?? '');

    if ($dsn === '' || $username === '') {
        throw new RuntimeException('Database configuration is incomplete.');
    }

    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

function admin_request_fingerprint(): string
{
    $config = admin_get_auth_config();
    return hash(
        'sha256',
        implode('|', [
            $config['session_secret'] ?? '',
            (string) ($_SERVER['HTTP_USER_AGENT'] ?? ''),
            (string) ($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? ''),
        ])
    );
}

function admin_get_csrf_token(): string
{
    if (!isset($_SESSION['admin_csrf']) || !is_string($_SESSION['admin_csrf']) || $_SESSION['admin_csrf'] === '') {
        $_SESSION['admin_csrf'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['admin_csrf'];
}

function admin_validate_csrf_token(?string $token): bool
{
    if (!is_string($token) || $token === '') {
        return false;
    }

    $stored = $_SESSION['admin_csrf'] ?? '';
    return is_string($stored) && $stored !== '' && hash_equals($stored, $token);
}

function admin_login_request_key(): string
{
    return trim((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
}

function admin_rate_limit_path(string $requestKey): ?string
{
    $tempDir = sys_get_temp_dir();
    if ($tempDir === '' || !is_dir($tempDir) || !is_writable($tempDir)) {
        return null;
    }

    return rtrim($tempDir, DIRECTORY_SEPARATOR)
        . DIRECTORY_SEPARATOR
        . 'naierm-admin-login-'
        . sha1($requestKey)
        . '.json';
}

function admin_get_rate_limit_state(string $requestKey): array
{
    $default = [
        'attempts' => 0,
        'first_attempt_at' => time(),
        'locked_until' => 0,
    ];

    $path = admin_rate_limit_path($requestKey);
    if ($path === null || !is_file($path)) {
        return $default;
    }

    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') {
        return $default;
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return $default;
    }

    return [
        'attempts' => (int) ($decoded['attempts'] ?? 0),
        'first_attempt_at' => (int) ($decoded['first_attempt_at'] ?? time()),
        'locked_until' => (int) ($decoded['locked_until'] ?? 0),
    ];
}

function admin_write_rate_limit_state(string $requestKey, array $state): void
{
    $path = admin_rate_limit_path($requestKey);
    if ($path === null) {
        return;
    }

    file_put_contents($path, json_encode($state, JSON_UNESCAPED_SLASHES));
}

function admin_check_login_rate_limit(string $requestKey): array
{
    $state = admin_get_rate_limit_state($requestKey);
    $now = time();

    if ($state['locked_until'] > $now) {
        return [
            'allowed' => false,
            'retry_after' => $state['locked_until'] - $now,
        ];
    }

    if (($now - $state['first_attempt_at']) > 900) {
        admin_write_rate_limit_state($requestKey, [
            'attempts' => 0,
            'first_attempt_at' => $now,
            'locked_until' => 0,
        ]);
    }

    return [
        'allowed' => true,
        'retry_after' => 0,
    ];
}

function admin_record_login_failure(string $requestKey): array
{
    $now = time();
    $state = admin_get_rate_limit_state($requestKey);

    if (($now - $state['first_attempt_at']) > 900) {
        $state = [
            'attempts' => 0,
            'first_attempt_at' => $now,
            'locked_until' => 0,
        ];
    }

    $state['attempts']++;

    if ($state['attempts'] >= 5) {
        $state['locked_until'] = $now + 900;
    }

    admin_write_rate_limit_state($requestKey, $state);

    return [
        'allowed' => $state['locked_until'] <= $now,
        'retry_after' => max(0, $state['locked_until'] - $now),
    ];
}

function admin_clear_login_failures(string $requestKey): void
{
    $path = admin_rate_limit_path($requestKey);
    if ($path !== null && is_file($path)) {
        @unlink($path);
    }
}

function admin_current_user(): ?array
{
    if (!admin_is_auth_configured()) {
        unset($_SESSION['admin_user']);
        return null;
    }

    $user = $_SESSION['admin_user'] ?? null;
    if (!is_array($user)) {
        return null;
    }

    $expectedFingerprint = admin_request_fingerprint();
    $storedFingerprint = (string) ($user['fingerprint'] ?? '');
    if ($storedFingerprint === '' || !hash_equals($expectedFingerprint, $storedFingerprint)) {
        unset($_SESSION['admin_user']);
        return null;
    }

    return [
        'email' => (string) ($user['email'] ?? ''),
        'display_name' => (string) ($user['display_name'] ?? 'Admin'),
        'logged_in_at' => (int) ($user['logged_in_at'] ?? time()),
    ];
}

function admin_complete_login(array $user): void
{
    session_regenerate_id(true);
    $_SESSION['admin_user'] = [
        'email' => (string) $user['email'],
        'display_name' => (string) $user['display_name'],
        'logged_in_at' => time(),
        'fingerprint' => admin_request_fingerprint(),
    ];
    admin_get_csrf_token();
}

function admin_logout(): void
{
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'] ?? '/',
            'domain' => $params['domain'] ?? '',
            'secure' => (bool) ($params['secure'] ?? false),
            'httponly' => (bool) ($params['httponly'] ?? true),
            'samesite' => $params['samesite'] ?? 'Strict',
        ]);
    }

    session_destroy();
}

function admin_attempt_login(string $email, string $password): ?array
{
    $normalizedEmail = strtolower(trim($email));
    $config = admin_get_auth_config();

    foreach ($config['users'] as $user) {
        if (!hash_equals((string) $user['email'], $normalizedEmail)) {
            continue;
        }

        if (password_verify($password, (string) $user['password_hash'])) {
            return $user;
        }
    }

    return null;
}

function admin_redirect(string $path): never
{
    header('Location: ' . $path);
    exit;
}

function admin_require_login(): array
{
    $user = admin_current_user();
    if ($user === null) {
        admin_redirect('/admin/login/index.php');
    }

    return $user;
}

function admin_visible_submission_filter_sql(): string
{
    return "
        s.id NOT LIKE 'codex-test-%'
        AND LOWER(COALESCE(s.name, '')) NOT LIKE '%codex test%'
        AND LOWER(COALESCE(s.config_name, '')) NOT LIKE '%codex test%'
    ";
}

function admin_compute_work_incentive(?array $result): ?float
{
    $personas = $result['citizenModel']['personaOutcomes'] ?? null;
    if (!is_array($personas) || count($personas) < 2) {
        return null;
    }

    $totalRetention = 0.0;
    $count = 0;

    for ($index = 0; $index < count($personas) - 1; $index++) {
        $current = $personas[$index];
        $next = $personas[$index + 1];
        $incomeDelta = (float) (($next['earnedIncome'] ?? 0) - ($current['earnedIncome'] ?? 0));
        $netDelta = (float) (($next['netIncome'] ?? 0) - ($current['netIncome'] ?? 0));

        if ($incomeDelta <= 0) {
            continue;
        }

        $totalRetention += ($netDelta / $incomeDelta) * 100;
        $count++;
    }

    return $count > 0 ? ($totalRetention / $count) : null;
}

function admin_decode_json_field(?string $value): array
{
    if (!is_string($value) || trim($value) === '') {
        return [];
    }

    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}

function admin_format_currency_short(float|int|null $value, int $decimals = 1): string
{
    if ($value === null) {
        return 'n/a';
    }

    $absValue = abs((float) $value);
    $sign = ((float) $value) > 0 ? '+' : (((float) $value) < 0 ? '-' : '');

    if ($absValue >= 1_000_000_000_000) {
        return sprintf('%s$%sT', $sign, number_format($absValue / 1_000_000_000_000, $decimals));
    }

    if ($absValue >= 1_000_000_000) {
        return sprintf('%s$%sB', $sign, number_format($absValue / 1_000_000_000, $decimals));
    }

    if ($absValue >= 1_000_000) {
        return sprintf('%s$%sM', $sign, number_format($absValue / 1_000_000, $decimals));
    }

    return sprintf('%s$%s', $sign, number_format($absValue, $decimals));
}

function admin_format_percent(float|int|null $value, int $decimals = 1): string
{
    if ($value === null) {
        return 'n/a';
    }

    return number_format((float) $value, $decimals) . '%';
}

function admin_format_datetime(?string $value): string
{
    if (!is_string($value) || trim($value) === '') {
        return 'n/a';
    }

    $timestamp = strtotime($value);
    if ($timestamp === false) {
        return $value;
    }

    return date('M j, Y g:i A', $timestamp);
}

function admin_json_pretty(mixed $value): string
{
    $encoded = json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    return is_string($encoded) ? $encoded : '{}';
}

function admin_submission_summary(array $submissionPayload): array
{
    $surveyResponse = $submissionPayload['survey_response'] ?? [];
    $policyModel = is_array($surveyResponse) ? ($surveyResponse['policy_model'] ?? []) : [];
    $selected = $submissionPayload['scenario_inputs']['selected_policy_variables'] ?? [];

    return [
        'bel_monthly' => $policyModel['bel_monthly'] ?? null,
        'dependent_policy' => $policyModel['dependent_policy'] ?? null,
        'retirement' => $policyModel['retirement'] ?? null,
        'healthcare' => $policyModel['healthcare'] ?? null,
        'revenue_mode' => $selected['revenue_architecture_mode'] ?? null,
    ];
}
