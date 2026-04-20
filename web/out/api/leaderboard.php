<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

require_method('GET');

$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 100;
$limit = max(1, min($limit, 200));

$pdo = get_pdo();
$visibleSubmissionFilter = "
    id NOT LIKE 'codex-test-%'
    AND LOWER(COALESCE(name, '')) NOT LIKE '%codex test%'
    AND LOWER(COALESCE(config_name, '')) NOT LIKE '%codex test%'
";

try {
    $countStatement = $pdo->query("SELECT COUNT(*) FROM submissions WHERE {$visibleSubmissionFilter}");
    $totalCount = (int) $countStatement->fetchColumn();

    $statement = $pdo->prepare(
        'SELECT
            id,
            name,
            config_name,
            token_tax_rate,
            ubi_annual,
            breakout_point,
            is_solvent,
            surplus_deficit,
            created_at,
            config,
            result,
            submission_payload_json
         FROM submissions
         WHERE ' . $visibleSubmissionFilter . '
         ORDER BY created_at DESC
         LIMIT :limit'
    );
    $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
    $statement->execute();
    $rows = $statement->fetchAll();
} catch (Throwable $error) {
    respond_error('Failed to load leaderboard data.', 500);
}

$submissions = array_map(static function (array $row): array {
    $config = json_decode((string) ($row['config'] ?? '{}'), true);
    $result = json_decode((string) ($row['result'] ?? '{}'), true);
    $submissionPayload = json_decode((string) ($row['submission_payload_json'] ?? 'null'), true);

    return [
        'id' => (string) ($row['id'] ?? ''),
        'name' => as_string_or_null($row['name'] ?? null),
        'config_name' => as_string_or_null($row['config_name'] ?? null),
        'token_tax_rate' => as_number_or_null($row['token_tax_rate'] ?? null),
        'ubi_annual' => as_number_or_null($row['ubi_annual'] ?? null),
        'breakout_point' => as_number_or_null($row['breakout_point'] ?? null),
        'is_solvent' => bool_from_mixed($row['is_solvent'] ?? false),
        'surplus_deficit' => as_number_or_null($row['surplus_deficit'] ?? null),
        'created_at' => (string) ($row['created_at'] ?? ''),
        'config' => is_array($config) ? $config : [],
        'result' => is_array($result) ? $result : [],
        'submission_payload_json' => is_array($submissionPayload) ? $submissionPayload : null,
    ];
}, $rows);

respond_json([
    'success' => true,
    'totalCount' => $totalCount,
    'submissions' => $submissions,
]);
