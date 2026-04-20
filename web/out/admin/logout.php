<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !admin_validate_csrf_token($_POST['csrf_token'] ?? null)) {
    http_response_code(405);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Method not allowed.';
    exit;
}

admin_logout();
admin_redirect('/admin/login/index.php?logout=1');
