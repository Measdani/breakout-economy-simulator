<?php

declare(strict_types=1);

require_once __DIR__ . '/_layout.php';

function admin_submission_kind(array $payload): string
{
    $surveyResponse = $payload['survey_response'] ?? null;
    $surveyName = is_array($surveyResponse) ? trim((string) ($surveyResponse['survey_name'] ?? '')) : '';

    return $surveyName !== '' ? 'survey' : 'simulator';
}

function admin_submission_kind_label(string $kind): string
{
    return $kind === 'survey' ? 'Survey' : 'Simulator';
}

function admin_pretty_choice(mixed $value): string
{
    if ($value === null) {
        return 'n/a';
    }

    if (is_bool($value)) {
        return $value ? 'Yes' : 'No';
    }

    if (is_int($value) || is_float($value)) {
        if (!is_finite((float) $value)) {
            return 'n/a';
        }

        return number_format((float) $value, ((float) $value === floor((float) $value)) ? 0 : 2);
    }

    if (is_array($value)) {
        $encoded = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        return is_string($encoded) ? $encoded : 'n/a';
    }

    $text = trim((string) $value);
    if ($text === '') {
        return 'n/a';
    }

    return ucwords(str_replace(['_', '-'], ' ', $text));
}

function admin_humanize_key(string $value): string
{
    $value = preg_replace('/(?<!^)[A-Z]/', ' $0', $value);
    return admin_pretty_choice($value);
}

function admin_csv_cell(mixed $value): string
{
    if ($value === null) {
        return '';
    }

    if (is_bool($value)) {
        $value = $value ? 'true' : 'false';
    } elseif (is_array($value)) {
        $encoded = json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $value = is_string($encoded) ? $encoded : '';
    } else {
        $value = (string) $value;
    }

    return preg_match('/^\s*[=+\-@]/', $value) === 1 ? "'" . $value : $value;
}

function admin_flatten_csv_value(mixed $value, string $prefix, array &$out): void
{
    if ($value === null) {
        $out[$prefix] = '';
        return;
    }

    if (is_array($value)) {
        if ($value === []) {
            $out[$prefix] = '';
            return;
        }

        $keys = array_keys($value);
        $isSequential = $keys === range(0, count($value) - 1);

        if ($isSequential) {
            $out[$prefix] = admin_csv_cell($value);
            return;
        }

        foreach ($value as $key => $nestedValue) {
            if (!is_string($key) && !is_int($key)) {
                continue;
            }

            $nestedPrefix = $prefix === '' ? (string) $key : $prefix . '_' . (string) $key;
            admin_flatten_csv_value($nestedValue, $nestedPrefix, $out);
        }

        return;
    }

    $out[$prefix] = admin_csv_cell($value);
}

function admin_flatten_csv_row(array $data): array
{
    $flattened = [];

    foreach ($data as $key => $value) {
        if (!is_string($key) && !is_int($key)) {
            continue;
        }

        admin_flatten_csv_value($value, (string) $key, $flattened);
    }

    return $flattened;
}

function admin_stream_csv_download(string $filename, array $rows): never
{
    $headers = [];

    foreach ($rows as $row) {
        foreach (array_keys($row) as $header) {
            if (!in_array($header, $headers, true)) {
                $headers[] = $header;
            }
        }
    }

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    $output = fopen('php://output', 'wb');
    if ($output === false) {
        http_response_code(500);
        exit;
    }

    fwrite($output, "\xEF\xBB\xBF");
    fputcsv($output, $headers);

    foreach ($rows as $row) {
        $line = [];

        foreach ($headers as $header) {
            $line[] = admin_csv_cell($row[$header] ?? null);
        }

        fputcsv($output, $line);
    }

    fclose($output);
    exit;
}

function admin_build_survey_snapshot(array $row, array $payload): array
{
    $surveyResponse = is_array($payload['survey_response'] ?? null) ? $payload['survey_response'] : [];
    $responses = is_array($surveyResponse['responses'] ?? null) ? $surveyResponse['responses'] : [];
    $policyModel = is_array($surveyResponse['policy_model'] ?? null) ? $surveyResponse['policy_model'] : [];

    $alias = trim((string) ($row['name'] ?? ''));
    if ($alias === '' && is_string($responses['alias'] ?? null)) {
        $alias = trim((string) $responses['alias']);
    }

    $belMonthly = $policyModel['bel_monthly'] ?? null;

    return [
        'survey_name' => trim((string) ($surveyResponse['survey_name'] ?? 'Survey response')),
        'survey_version' => trim((string) ($surveyResponse['survey_version'] ?? '')),
        'alias' => $alias !== '' ? $alias : 'Anonymous',
        'email' => trim((string) ($row['email'] ?? '')),
        'country' => admin_pretty_choice($responses['country'] ?? null),
        'financial_security' => admin_pretty_choice($responses['financialSecurity'] ?? null),
        'employment' => admin_pretty_choice($responses['employmentSituation'] ?? null),
        'dependents' => admin_pretty_choice($responses['dependentsCount'] ?? null),
        'education' => admin_pretty_choice($responses['educationLevel'] ?? null),
        'education_alignment' => admin_pretty_choice($responses['educationAlignment'] ?? null),
        'policy_bel_monthly' => is_int($belMonthly) || is_float($belMonthly)
            ? '$' . number_format((float) $belMonthly)
            : 'n/a',
        'policy_dependent' => admin_pretty_choice($policyModel['dependent_policy'] ?? null),
        'policy_retirement' => admin_pretty_choice($policyModel['retirement'] ?? null),
        'policy_healthcare' => admin_pretty_choice($policyModel['healthcare'] ?? null),
        'responses' => $responses,
    ];
}

function admin_prepare_survey_export_rows(array $rows): array
{
    $exportRows = [];

    foreach ($rows as $row) {
        $payload = is_array($row['_payload'] ?? null)
            ? $row['_payload']
            : admin_decode_json_field((string) ($row['submission_payload_json'] ?? ''));
        $snapshot = admin_build_survey_snapshot($row, $payload);
        $surveyResponse = is_array($payload['survey_response'] ?? null) ? $payload['survey_response'] : [];
        $policyModel = is_array($surveyResponse['policy_model'] ?? null) ? $surveyResponse['policy_model'] : [];

        $exportRows[] = array_merge([
            'submission_type' => 'survey',
            'id' => (string) ($row['id'] ?? ''),
            'created_at' => (string) ($row['created_at'] ?? ''),
            'alias' => $snapshot['alias'],
            'email' => $snapshot['email'],
            'survey_name' => (string) $snapshot['survey_name'],
            'survey_version' => (string) ($surveyResponse['survey_version'] ?? ''),
            'country' => $snapshot['country'],
            'financial_security' => $snapshot['financial_security'],
            'employment_situation' => $snapshot['employment'],
            'dependents_count' => $snapshot['dependents'],
            'education_level' => $snapshot['education'],
            'education_alignment' => $snapshot['education_alignment'],
            'policy_bel_monthly' => (string) $snapshot['policy_bel_monthly'],
            'policy_dependent' => (string) $snapshot['policy_dependent'],
            'policy_retirement' => (string) $snapshot['policy_retirement'],
            'policy_healthcare' => (string) $snapshot['policy_healthcare'],
        ], admin_flatten_csv_row([
            'survey_response' => $snapshot['responses'],
            'survey_policy_model' => $policyModel,
        ]));
    }

    return $exportRows;
}

function admin_prepare_simulator_export_rows(array $rows): array
{
    $exportRows = [];

    foreach ($rows as $row) {
        $payload = is_array($row['_payload'] ?? null)
            ? $row['_payload']
            : admin_decode_json_field((string) ($row['submission_payload_json'] ?? ''));
        $result = is_array($row['_result'] ?? null)
            ? $row['_result']
            : admin_decode_json_field((string) ($row['result'] ?? ''));
        $rowName = trim((string) ($row['config_name'] ?? '')) !== ''
            ? (string) $row['config_name']
            : ((string) ($row['name'] ?? '') !== '' ? (string) $row['name'] : 'Untitled scenario');

        $exportRows[] = array_merge([
            'submission_type' => 'simulator',
            'id' => (string) ($row['id'] ?? ''),
            'created_at' => (string) ($row['created_at'] ?? ''),
            'scenario_name' => $rowName,
            'alias' => (string) ($row['name'] ?? 'Anonymous'),
            'email' => (string) ($row['email'] ?? ''),
            'is_solvent' => !empty($row['is_solvent']),
            'surplus_deficit' => (float) ($row['surplus_deficit'] ?? 0),
            'ubi_annual' => (float) ($row['ubi_annual'] ?? 0),
            'token_tax_rate' => (float) ($row['token_tax_rate'] ?? 0),
            'breakout_point' => (float) ($row['breakout_point'] ?? 0),
            'work_incentive_pct' => $row['_work_incentive'] ?? null,
        ], $payload !== [] ? admin_flatten_csv_row($payload) : admin_flatten_csv_row([
            'config' => admin_decode_json_field((string) ($row['config'] ?? '')),
            'result' => $result,
        ]));
    }

    return $exportRows;
}

$user = admin_require_login();
$searchTerm = trim((string) ($_GET['q'] ?? ''));
$selectedSubmissionId = trim((string) ($_GET['submission'] ?? ''));
$exportType = trim((string) ($_GET['export'] ?? ''));
$dashboardError = null;

$stats = [
    'total_submissions' => 0,
    'simulator_count' => 0,
    'survey_count' => 0,
    'solvent_count' => 0,
    'avg_balance' => 0.0,
    'latest_submission_at' => null,
    'feedback_count' => 0,
    'contact_count' => 0,
];
$submissions = [];
$surveySubmissions = [];
$simulatorSubmissions = [];
$feedbackRows = [];
$selectedSubmission = null;

try {
    $pdo = admin_get_pdo();
    $filter = admin_visible_submission_filter_sql();

    $statsStatement = $pdo->query(
        "SELECT
            COUNT(*) AS total_submissions,
            SUM(CASE WHEN s.is_solvent = 1 THEN 1 ELSE 0 END) AS solvent_count,
            AVG(s.surplus_deficit) AS avg_balance,
            MAX(s.created_at) AS latest_submission_at
         FROM submissions s
         WHERE {$filter}"
    );
    $statsRow = $statsStatement->fetch() ?: [];
    $stats['total_submissions'] = (int) ($statsRow['total_submissions'] ?? 0);
    $stats['solvent_count'] = (int) ($statsRow['solvent_count'] ?? 0);
    $stats['avg_balance'] = (float) ($statsRow['avg_balance'] ?? 0);
    $stats['latest_submission_at'] = is_string($statsRow['latest_submission_at'] ?? null)
        ? $statsRow['latest_submission_at']
        : null;

    $stats['feedback_count'] = (int) $pdo->query('SELECT COUNT(*) FROM feedback')->fetchColumn();
    $stats['contact_count'] = (int) $pdo->query('SELECT COUNT(*) FROM submission_contacts')->fetchColumn();

    $searchSql = '';
    if ($searchTerm !== '') {
        $searchSql = "
            AND (
                LOWER(COALESCE(s.name, '')) LIKE :search
                OR LOWER(COALESCE(sc.email, '')) LIKE :search
                OR LOWER(COALESCE(s.config_name, '')) LIKE :search
                OR LOWER(COALESCE(s.id, '')) LIKE :search
            )
        ";
    }

    $submissionsSql = "
        SELECT
            s.id,
            s.created_at,
            s.name,
            s.config_name,
            s.surplus_deficit,
            s.ubi_annual,
            s.token_tax_rate,
            s.breakout_point,
            s.is_solvent,
            s.config,
            s.result,
            s.submission_payload_json,
            sc.email
        FROM submissions s
        LEFT JOIN submission_contacts sc ON sc.submission_id = s.id
        WHERE {$filter}
        {$searchSql}
        ORDER BY s.created_at DESC
    ";
    $submissionsStatement = $pdo->prepare($submissionsSql);
    if ($searchTerm !== '') {
        $submissionsStatement->bindValue(':search', '%' . strtolower($searchTerm) . '%', PDO::PARAM_STR);
    }
    $submissionsStatement->execute();
    $submissions = $submissionsStatement->fetchAll();

    foreach ($submissions as $index => $row) {
        $payload = admin_decode_json_field((string) ($row['submission_payload_json'] ?? ''));
        $result = admin_decode_json_field((string) ($row['result'] ?? ''));
        $kind = admin_submission_kind($payload);
        $workIncentive = admin_compute_work_incentive($result);

        $submissions[$index]['_payload'] = $payload;
        $submissions[$index]['_result'] = $result;
        $submissions[$index]['_kind'] = $kind;
        $submissions[$index]['_work_incentive'] = $workIncentive;

        if ($kind === 'survey') {
            $surveySubmissions[] = $submissions[$index];
        } else {
            $simulatorSubmissions[] = $submissions[$index];
        }
    }

    $stats['survey_count'] = count($surveySubmissions);
    $stats['simulator_count'] = count($simulatorSubmissions);

    if ($exportType === 'survey') {
        admin_stream_csv_download('survey-submissions-' . date('Y-m-d') . '.csv', admin_prepare_survey_export_rows($surveySubmissions));
    }

    if ($exportType === 'simulator') {
        admin_stream_csv_download('simulator-submissions-' . date('Y-m-d') . '.csv', admin_prepare_simulator_export_rows($simulatorSubmissions));
    }

    $feedbackStatement = $pdo->query(
        'SELECT
            f.id,
            f.created_at,
            f.name,
            f.category,
            f.message,
            f.config_name,
            fc.email
         FROM feedback f
         LEFT JOIN feedback_contacts fc ON fc.feedback_id = f.id
         ORDER BY f.created_at DESC
         LIMIT 12'
    );
    $feedbackRows = $feedbackStatement->fetchAll();

    if ($selectedSubmissionId !== '') {
        $selectedStatement = $pdo->prepare(
            'SELECT
                s.id,
                s.created_at,
                s.name,
                s.config_name,
                s.surplus_deficit,
                s.ubi_annual,
                s.token_tax_rate,
                s.breakout_point,
                s.is_solvent,
                s.config,
                s.result,
                s.submission_payload_json,
                sc.email
             FROM submissions s
             LEFT JOIN submission_contacts sc ON sc.submission_id = s.id
             WHERE s.id = :id
             LIMIT 1'
        );
        $selectedStatement->bindValue(':id', $selectedSubmissionId, PDO::PARAM_STR);
        $selectedStatement->execute();
        $selectedSubmission = $selectedStatement->fetch() ?: null;
    }

    if ($selectedSubmission === null && $simulatorSubmissions !== []) {
        $selectedSubmission = $simulatorSubmissions[0];
    }

    if ($selectedSubmission === null && $surveySubmissions !== []) {
        $selectedSubmission = $surveySubmissions[0];
    }
} catch (Throwable $error) {
    $dashboardError = 'The admin dashboard could not load data. Check the SiteGround database config and table schema.';
}

$solventRate = $stats['total_submissions'] > 0
    ? ($stats['solvent_count'] / $stats['total_submissions']) * 100
    : 0;

$selectedPayload = is_array($selectedSubmission)
    ? admin_decode_json_field((string) ($selectedSubmission['submission_payload_json'] ?? ''))
    : [];
$selectedResult = is_array($selectedSubmission)
    ? admin_decode_json_field((string) ($selectedSubmission['result'] ?? ''))
    : [];
$selectedSummary = admin_submission_summary($selectedPayload);
$selectedWorkIncentive = admin_compute_work_incentive($selectedResult);
$selectedKind = admin_submission_kind($selectedPayload);
$selectedSurveySnapshot = is_array($selectedSubmission)
    ? admin_build_survey_snapshot($selectedSubmission, $selectedPayload)
    : [];
$selectedSurveyResponses = is_array($selectedPayload['survey_response']['responses'] ?? null)
    ? $selectedPayload['survey_response']['responses']
    : [];

$surveyExportParams = ['export' => 'survey'];
if ($searchTerm !== '') {
    $surveyExportParams['q'] = $searchTerm;
}

$simulatorExportParams = ['export' => 'simulator'];
if ($searchTerm !== '') {
    $simulatorExportParams['q'] = $searchTerm;
}

admin_render_shell_start('Dashboard', [
    'user' => $user,
    'active' => 'dashboard',
    'description' => 'Review private submission contacts, survey responses, simulator scenarios, and recent feedback.',
]);
?>
  <section class="admin-grid" style="margin-bottom: 1.25rem;">
    <div class="admin-panel">
      <div class="admin-panel__header">
        <h1 class="admin-panel__title">Admin Dashboard</h1>
        <p class="admin-panel__description">
          Private view of survey responses, simulator scenarios, contact details, and research feedback captured through the SiteGround SQL bridge.
        </p>
      </div>
      <div class="admin-panel__body">
        <?php if ($dashboardError !== null): ?>
          <div class="admin-alert admin-alert--error"><?= admin_escape($dashboardError) ?></div>
        <?php endif; ?>

        <div class="admin-grid admin-grid--cards">
          <article class="admin-card">
            <p class="admin-card__label">Total Submissions</p>
            <p class="admin-card__value"><?= number_format($stats['total_submissions']) ?></p>
            <p class="admin-card__meta">Visible entries after filtering old Codex test data.</p>
          </article>
          <article class="admin-card">
            <p class="admin-card__label">Simulator Rows</p>
            <p class="admin-card__value"><?= number_format($stats['simulator_count']) ?></p>
            <p class="admin-card__meta">Full scenario runs submitted from the simulator.</p>
          </article>
          <article class="admin-card">
            <p class="admin-card__label">Survey Rows</p>
            <p class="admin-card__value"><?= number_format($stats['survey_count']) ?></p>
            <p class="admin-card__meta">Quick survey responses with derived policy models.</p>
          </article>
          <article class="admin-card">
            <p class="admin-card__label">Solvent Share</p>
            <p class="admin-card__value"><?= admin_escape(admin_format_percent($solventRate)) ?></p>
            <p class="admin-card__meta"><?= number_format($stats['solvent_count']) ?> solvent scenarios on record.</p>
          </article>
          <article class="admin-card">
            <p class="admin-card__label">Average Balance</p>
            <p class="admin-card__value"><?= admin_escape(admin_format_currency_short($stats['avg_balance'])) ?></p>
            <p class="admin-card__meta">Mean fiscal balance across the visible dataset.</p>
          </article>
          <article class="admin-card">
            <p class="admin-card__label">Private Contacts</p>
            <p class="admin-card__value"><?= number_format($stats['contact_count']) ?></p>
            <p class="admin-card__meta">Submission emails stored privately for follow-up.</p>
          </article>
          <article class="admin-card">
            <p class="admin-card__label">Feedback Notes</p>
            <p class="admin-card__value"><?= number_format($stats['feedback_count']) ?></p>
            <p class="admin-card__meta">Recent research feedback sent through the public site.</p>
          </article>
          <article class="admin-card">
            <p class="admin-card__label">Latest Intake</p>
            <p class="admin-card__value" style="font-size: 1.15rem; line-height: 1.35;">
              <?= admin_escape(admin_format_datetime($stats['latest_submission_at'])) ?>
            </p>
            <p class="admin-card__meta">Newest public submission recorded in MySQL.</p>
          </article>
        </div>
      </div>
    </div>
  </section>

  <section class="admin-grid" style="margin-bottom: 1.25rem;">
    <div class="admin-panel">
      <div class="admin-panel__header">
        <h2 class="admin-panel__title">Submission Explorer</h2>
        <p class="admin-panel__description">Search once, then download survey or simulator rows as separate CSV files.</p>
      </div>
      <div class="admin-panel__body">
        <div class="admin-toolbar">
          <form class="admin-search" method="get" action="/admin/index.php">
            <input type="text" name="q" placeholder="Search by alias, email, scenario name, or submission id..." value="<?= admin_escape($searchTerm) ?>">
            <?php if ($selectedSubmissionId !== ''): ?>
              <input type="hidden" name="submission" value="<?= admin_escape($selectedSubmissionId) ?>">
            <?php endif; ?>
            <button type="submit" class="admin-button">Search</button>
            <?php if ($searchTerm !== ''): ?>
              <a class="admin-button--secondary" href="/admin/index.php">Clear</a>
            <?php endif; ?>
          </form>

          <div class="admin-inline-actions">
            <?php if ($surveySubmissions !== []): ?>
              <a class="admin-button" href="/admin/index.php?<?= admin_escape(http_build_query($surveyExportParams)) ?>">
                Download Survey CSV (<?= number_format(count($surveySubmissions)) ?>)
              </a>
            <?php else: ?>
              <span class="admin-button--secondary is-disabled">Download Survey CSV (0)</span>
            <?php endif; ?>

            <?php if ($simulatorSubmissions !== []): ?>
              <a class="admin-button" href="/admin/index.php?<?= admin_escape(http_build_query($simulatorExportParams)) ?>">
                Download Simulator CSV (<?= number_format(count($simulatorSubmissions)) ?>)
              </a>
            <?php else: ?>
              <span class="admin-button--secondary is-disabled">Download Simulator CSV (0)</span>
            <?php endif; ?>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="admin-grid admin-grid--content" style="margin-bottom: 1.25rem;">
    <div class="admin-panel">
      <div class="admin-panel__header">
        <h2 class="admin-panel__title">Survey Responses</h2>
        <p class="admin-panel__description">Quick survey rows are separated here so they stay distinct from simulator scenarios.</p>
      </div>
      <div class="admin-panel__body">
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Alias</th>
                <th>Contact</th>
                <th>Country</th>
                <th>Financial Security</th>
                <th>Policy Snapshot</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <?php if ($surveySubmissions === []): ?>
                <tr>
                  <td colspan="7"><p class="admin-empty">No survey submissions match that search yet.</p></td>
                </tr>
              <?php endif; ?>

              <?php foreach ($surveySubmissions as $row): ?>
                <?php $surveySnapshot = admin_build_survey_snapshot($row, is_array($row['_payload'] ?? null) ? $row['_payload'] : []); ?>
                <tr>
                  <td><?= admin_escape(admin_format_datetime((string) ($row['created_at'] ?? ''))) ?></td>
                  <td>
                    <a class="admin-table__title" href="/admin/index.php?<?= admin_escape(http_build_query(['q' => $searchTerm, 'submission' => $row['id']])) ?>">
                      <?= admin_escape((string) $surveySnapshot['alias']) ?>
                    </a>
                    <span class="admin-table__meta"><?= admin_escape((string) ($row['id'] ?? '')) ?></span>
                  </td>
                  <td>
                    <?php if ((string) $surveySnapshot['email'] !== ''): ?>
                      <a href="mailto:<?= admin_escape((string) $surveySnapshot['email']) ?>"><?= admin_escape((string) $surveySnapshot['email']) ?></a>
                    <?php else: ?>
                      <span class="admin-muted">No email submitted</span>
                    <?php endif; ?>
                  </td>
                  <td><?= admin_escape((string) $surveySnapshot['country']) ?></td>
                  <td><?= admin_escape((string) $surveySnapshot['financial_security']) ?></td>
                  <td>
                    <span class="admin-table__title"><?= admin_escape((string) $surveySnapshot['policy_bel_monthly']) ?></span>
                    <span class="admin-table__meta">
                      <?= admin_escape((string) $surveySnapshot['policy_dependent']) ?> •
                      <?= admin_escape((string) $surveySnapshot['policy_retirement']) ?> •
                      <?= admin_escape((string) $surveySnapshot['policy_healthcare']) ?>
                    </span>
                  </td>
                  <td>
                    <a class="admin-button--secondary" href="/admin/index.php?<?= admin_escape(http_build_query(['q' => $searchTerm, 'submission' => $row['id']])) ?>">
                      View details
                    </a>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="admin-panel">
      <div class="admin-panel__header">
        <h2 class="admin-panel__title">Selected Submission</h2>
        <p class="admin-panel__description">Clean summary view for one record without the raw payload dumps from the bridge setup phase.</p>
      </div>
      <div class="admin-panel__body">
        <?php if (!is_array($selectedSubmission)): ?>
          <p class="admin-empty">Choose a survey or simulator row to inspect the stored details.</p>
        <?php else: ?>
          <?php
          $selectedScenarioName = trim((string) ($selectedSubmission['config_name'] ?? '')) !== ''
              ? (string) $selectedSubmission['config_name']
              : ((string) ($selectedSubmission['name'] ?? '') !== '' ? (string) $selectedSubmission['name'] : 'Untitled scenario');
          $selectedSurveyName = trim((string) ($selectedSurveySnapshot['survey_name'] ?? ''));
          ?>
          <div class="admin-statline">
            <span class="admin-chip"><?= admin_escape(admin_submission_kind_label($selectedKind)) ?></span>
            <span class="admin-chip <?= !empty($selectedSubmission['is_solvent']) ? 'admin-chip--good' : 'admin-chip--bad' ?>">
              <?= !empty($selectedSubmission['is_solvent']) ? 'Solvent' : 'Deficit' ?>
            </span>
            <span class="admin-chip"><?= admin_escape(admin_format_currency_short((float) ($selectedSubmission['surplus_deficit'] ?? 0))) ?></span>
            <span class="admin-chip"><?= admin_escape(admin_format_percent($selectedWorkIncentive)) ?> work incentive</span>
          </div>

          <div class="admin-kv">
            <div class="admin-kv__row">
              <div class="admin-kv__label">Submission type</div>
              <div class="admin-kv__value"><?= admin_escape(admin_submission_kind_label($selectedKind)) ?></div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label"><?= $selectedKind === 'survey' ? 'Survey name' : 'Scenario' ?></div>
              <div class="admin-kv__value">
                <?= admin_escape($selectedKind === 'survey' && $selectedSurveyName !== '' ? $selectedSurveyName : $selectedScenarioName) ?>
              </div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">Submission ID</div>
              <div class="admin-kv__value"><?= admin_escape((string) ($selectedSubmission['id'] ?? '')) ?></div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">Submitted</div>
              <div class="admin-kv__value"><?= admin_escape(admin_format_datetime((string) ($selectedSubmission['created_at'] ?? ''))) ?></div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">Alias</div>
              <div class="admin-kv__value">
                <?= admin_escape($selectedKind === 'survey' ? (string) ($selectedSurveySnapshot['alias'] ?? 'Anonymous') : (string) ($selectedSubmission['name'] ?? 'Anonymous')) ?>
              </div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">Private contact email</div>
              <div class="admin-kv__value">
                <?php if (!empty($selectedSubmission['email'])): ?>
                  <a href="mailto:<?= admin_escape((string) $selectedSubmission['email']) ?>"><?= admin_escape((string) $selectedSubmission['email']) ?></a>
                <?php else: ?>
                  <span class="admin-muted">No email submitted</span>
                <?php endif; ?>
              </div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">BEL / annual UBI</div>
              <div class="admin-kv__value">
                <?php if ($selectedSummary['bel_monthly'] !== null): ?>
                  <?= admin_escape('$' . number_format((float) $selectedSummary['bel_monthly']) . ' monthly') ?>
                <?php else: ?>
                  <?= admin_escape('$' . number_format((float) ($selectedSubmission['ubi_annual'] ?? 0)) . ' annual') ?>
                <?php endif; ?>
              </div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">Token tax rate</div>
              <div class="admin-kv__value"><?= admin_escape(number_format(((float) ($selectedSubmission['token_tax_rate'] ?? 0)) * 100, 3) . '%') ?></div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">Breakout point</div>
              <div class="admin-kv__value"><?= admin_escape('$' . number_format((float) ($selectedSubmission['breakout_point'] ?? 0))) ?></div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">Dependent policy</div>
              <div class="admin-kv__value"><?= admin_escape((string) ($selectedSummary['dependent_policy'] ?? 'n/a')) ?></div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">Retirement policy</div>
              <div class="admin-kv__value"><?= admin_escape((string) ($selectedSummary['retirement'] ?? 'n/a')) ?></div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">Healthcare policy</div>
              <div class="admin-kv__value"><?= admin_escape((string) ($selectedSummary['healthcare'] ?? 'n/a')) ?></div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">Public note</div>
              <div class="admin-kv__value">
                <?= admin_escape((string) ($selectedPayload['user_feedback']['user_feedback_text'] ?? ($selectedKind === 'survey' ? 'Submitted through the survey form.' : 'No note submitted.'))) ?>
              </div>
            </div>
          </div>

          <?php if ($selectedSurveyResponses !== []): ?>
            <div style="margin-top: 1rem;">
              <p class="admin-card__label">Survey Responses</p>
              <div class="admin-detail-grid">
                <?php foreach ($selectedSurveyResponses as $key => $value): ?>
                  <div class="admin-detail-card">
                    <span class="admin-detail-card__label"><?= admin_escape(admin_humanize_key((string) $key)) ?></span>
                    <span class="admin-detail-card__value"><?= admin_escape(admin_pretty_choice($value)) ?></span>
                  </div>
                <?php endforeach; ?>
              </div>
            </div>
          <?php endif; ?>
        <?php endif; ?>
      </div>
    </div>
  </section>

  <section class="admin-grid" style="margin-bottom: 1.25rem;">
    <div class="admin-panel">
      <div class="admin-panel__header">
        <h2 class="admin-panel__title">Simulator Submissions</h2>
        <p class="admin-panel__description">Scenario runs stay in their own table and export separately from survey intake.</p>
      </div>
      <div class="admin-panel__body">
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Scenario</th>
                <th>Private Contact</th>
                <th>Balance</th>
                <th>Work Incentive</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <?php if ($simulatorSubmissions === []): ?>
                <tr>
                  <td colspan="6"><p class="admin-empty">No simulator submissions match that search yet.</p></td>
                </tr>
              <?php endif; ?>

              <?php foreach ($simulatorSubmissions as $row): ?>
                <?php
                $rowName = trim((string) ($row['config_name'] ?? '')) !== ''
                    ? (string) $row['config_name']
                    : ((string) ($row['name'] ?? '') !== '' ? (string) $row['name'] : 'Untitled scenario');
                ?>
                <tr>
                  <td><?= admin_escape(admin_format_datetime((string) ($row['created_at'] ?? ''))) ?></td>
                  <td>
                    <a class="admin-table__title" href="/admin/index.php?<?= admin_escape(http_build_query(['q' => $searchTerm, 'submission' => $row['id']])) ?>">
                      <?= admin_escape($rowName) ?>
                    </a>
                    <span class="admin-table__meta"><?= admin_escape((string) ($row['id'] ?? '')) ?></span>
                  </td>
                  <td>
                    <?php if (!empty($row['email'])): ?>
                      <a href="mailto:<?= admin_escape((string) $row['email']) ?>"><?= admin_escape((string) $row['email']) ?></a>
                    <?php else: ?>
                      <span class="admin-muted">No email submitted</span>
                    <?php endif; ?>
                  </td>
                  <td>
                    <span class="admin-chip <?= !empty($row['is_solvent']) ? 'admin-chip--good' : 'admin-chip--bad' ?>">
                      <?= admin_escape(admin_format_currency_short((float) ($row['surplus_deficit'] ?? 0))) ?>
                    </span>
                  </td>
                  <td><?= admin_escape(admin_format_percent($row['_work_incentive'] ?? null)) ?></td>
                  <td>
                    <a class="admin-button--secondary" href="/admin/index.php?<?= admin_escape(http_build_query(['q' => $searchTerm, 'submission' => $row['id']])) ?>">
                      View details
                    </a>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <section class="admin-grid">
    <div class="admin-panel">
      <div class="admin-panel__header">
        <h2 class="admin-panel__title">Recent Feedback</h2>
        <p class="admin-panel__description">Private feedback intake helps you spot collaborator interest and follow-up opportunities.</p>
      </div>
      <div class="admin-panel__body">
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Category</th>
                <th>Name / contact</th>
                <th>Linked scenario</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              <?php if ($feedbackRows === []): ?>
                <tr>
                  <td colspan="5"><p class="admin-empty">No feedback has been submitted yet.</p></td>
                </tr>
              <?php endif; ?>

              <?php foreach ($feedbackRows as $feedback): ?>
                <tr>
                  <td><?= admin_escape(admin_format_datetime((string) ($feedback['created_at'] ?? ''))) ?></td>
                  <td><span class="admin-chip"><?= admin_escape((string) ($feedback['category'] ?? 'general')) ?></span></td>
                  <td>
                    <span class="admin-table__title"><?= admin_escape((string) ($feedback['name'] ?? 'Anonymous')) ?></span>
                    <?php if (!empty($feedback['email'])): ?>
                      <span class="admin-table__meta"><?= admin_escape((string) $feedback['email']) ?></span>
                    <?php endif; ?>
                  </td>
                  <td><?= admin_escape((string) ($feedback['config_name'] ?? 'No scenario attached')) ?></td>
                  <td><?= nl2br(admin_escape((string) ($feedback['message'] ?? ''))) ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
<?php
admin_render_shell_end();
