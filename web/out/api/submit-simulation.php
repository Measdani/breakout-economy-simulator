<?php

declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';

require_method('POST');

$payload = read_json_body();

if (is_honeypot_triggered($payload['honeypot'] ?? null)) {
    respond_json([
        'success' => true,
        'blocked' => true,
        'id' => '',
    ]);
}

$config = as_array($payload['config'] ?? null, 'config');
$result = as_array($payload['result'] ?? null, 'result');
$submissionPayload = as_array($payload['submissionPayload'] ?? null, 'submissionPayload');

$submissionMetadata = is_array($submissionPayload['model_metadata'] ?? null)
    ? $submissionPayload['model_metadata']
    : [];

$submissionId = sanitize_optional_text($submissionMetadata['submission_id'] ?? null, 64);
if ($submissionId === null) {
    $submissionId = generate_identifier();
}

$submissionPayload['model_metadata'] = [
    ...$submissionMetadata,
    'submission_id' => $submissionId,
];

$sanitizedName = sanitize_optional_text($payload['name'] ?? null, 50);
$sanitizedEmail = sanitize_optional_email($payload['email'] ?? null);
$sanitizedConfigName = sanitize_optional_text($payload['configName'] ?? null, 160) ?? 'Default';
$sanitizedDemographics = sanitize_demographics($payload['demographics'] ?? null);
$sanitizedFeedbackText = sanitize_optional_text($payload['userFeedbackText'] ?? null, 500);

if ($sanitizedDemographics !== null) {
    if (!isset($submissionPayload['scenario_inputs']) || !is_array($submissionPayload['scenario_inputs'])) {
        $submissionPayload['scenario_inputs'] = [];
    }

    $existingDemographics = is_array($submissionPayload['scenario_inputs']['demographics'] ?? null)
        ? $submissionPayload['scenario_inputs']['demographics']
        : [];

    $submissionPayload['scenario_inputs']['demographics'] = [
        ...$existingDemographics,
        'user_age_range' => $sanitizedDemographics['ageRange'] ?? null,
        'user_income_level' => $sanitizedDemographics['incomeLevel'] ?? null,
        'user_region' => $sanitizedDemographics['region'] ?? null,
        'user_affiliation' => $sanitizedDemographics['affiliation'] ?? null,
    ];
}

if ($sanitizedFeedbackText !== null) {
    if (!isset($submissionPayload['user_feedback']) || !is_array($submissionPayload['user_feedback'])) {
        $submissionPayload['user_feedback'] = [];
    }

    $submissionPayload['user_feedback']['user_feedback_text'] = $sanitizedFeedbackText;
}

$surplusDeficit = require_number($result['balance']['surplusDeficit'] ?? null, 'result.balance.surplusDeficit');
$tokenTaxRate = require_number($config['tokenTaxRate'] ?? null, 'config.tokenTaxRate');
$ubiAnnual = require_number($config['ubiAnnualPerAdult'] ?? null, 'config.ubiAnnualPerAdult');
$breakoutPoint = require_number($config['breakoutPoint'] ?? null, 'config.breakoutPoint');
$isSolvent = bool_from_mixed($result['balance']['isSolvent'] ?? false);

$pdo = get_pdo();

try {
    $pdo->beginTransaction();

    $insertSubmission = $pdo->prepare(
        'INSERT INTO submissions (
            id,
            name,
            config_name,
            config,
            result,
            surplus_deficit,
            ubi_annual,
            token_tax_rate,
            breakout_point,
            is_solvent,
            submission_payload_json
        ) VALUES (
            :id,
            :name,
            :config_name,
            :config,
            :result,
            :surplus_deficit,
            :ubi_annual,
            :token_tax_rate,
            :breakout_point,
            :is_solvent,
            :submission_payload_json
        )'
    );

    $insertSubmission->execute([
        ':id' => $submissionId,
        ':name' => $sanitizedName,
        ':config_name' => $sanitizedConfigName,
        ':config' => json_stringify($config),
        ':result' => json_stringify($result),
        ':surplus_deficit' => (int) round($surplusDeficit),
        ':ubi_annual' => (int) round($ubiAnnual),
        ':token_tax_rate' => $tokenTaxRate,
        ':breakout_point' => (int) round($breakoutPoint),
        ':is_solvent' => $isSolvent ? 1 : 0,
        ':submission_payload_json' => json_stringify($submissionPayload),
    ]);

    if ($sanitizedEmail !== null) {
        $insertContact = $pdo->prepare(
            'INSERT INTO submission_contacts (submission_id, email)
             VALUES (:submission_id, :email)'
        );

        $insertContact->execute([
            ':submission_id' => $submissionId,
            ':email' => $sanitizedEmail,
        ]);
    }

    $pdo->commit();
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    respond_error('Failed to store submission.', 500);
}

set_last_submission_cookie($submissionId);

respond_json([
    'success' => true,
    'id' => $submissionId,
]);
