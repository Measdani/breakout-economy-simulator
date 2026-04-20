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

$validCategories = ['bug', 'suggestion', 'question', 'general'];
$category = sanitize_required_text($payload['category'] ?? null, 20, 'Category');

if (!in_array($category, $validCategories, true)) {
    respond_error('Invalid feedback category.');
}

$feedbackId = generate_identifier();
$sanitizedName = sanitize_optional_text($payload['name'] ?? null, 50);
$sanitizedEmail = sanitize_optional_email($payload['email'] ?? null);
$sanitizedMessage = sanitize_required_text($payload['message'] ?? null, 500, 'Message');
$sanitizedConfigName = sanitize_optional_text($payload['configName'] ?? null, 160);
$configSnapshot = is_array($payload['config'] ?? null) ? $payload['config'] : null;
$surplusDeficit = as_number_or_null($payload['surplusDeficit'] ?? null);

$pdo = get_pdo();

try {
    $pdo->beginTransaction();

    $insertFeedback = $pdo->prepare(
        'INSERT INTO feedback (
            id,
            name,
            category,
            message,
            config_snapshot,
            surplus_deficit,
            config_name
        ) VALUES (
            :id,
            :name,
            :category,
            :message,
            :config_snapshot,
            :surplus_deficit,
            :config_name
        )'
    );

    $insertFeedback->execute([
        ':id' => $feedbackId,
        ':name' => $sanitizedName,
        ':category' => $category,
        ':message' => $sanitizedMessage,
        ':config_snapshot' => $configSnapshot === null ? null : json_stringify($configSnapshot),
        ':surplus_deficit' => $surplusDeficit === null ? null : (int) round($surplusDeficit),
        ':config_name' => $sanitizedConfigName,
    ]);

    if ($sanitizedEmail !== null) {
        $insertContact = $pdo->prepare(
            'INSERT INTO feedback_contacts (feedback_id, email)
             VALUES (:feedback_id, :email)'
        );

        $insertContact->execute([
            ':feedback_id' => $feedbackId,
            ':email' => $sanitizedEmail,
        ]);
    }

    $pdo->commit();
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    respond_error('Failed to store feedback.', 500);
}

respond_json([
    'success' => true,
    'id' => $feedbackId,
]);
