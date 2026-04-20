<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/_layout.php';

if (admin_current_user() !== null) {
    admin_redirect('/admin/index.php');
}

$errorMessage = null;
$successMessage = null;
$configWarning = null;

if (!admin_is_auth_configured()) {
    $configWarning = 'Admin auth is not configured yet. Add /siteground-config/admin-auth.php outside public_html before signing in.';
}

if (isset($_GET['logout'])) {
    $successMessage = 'You have been signed out.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $requestKey = admin_login_request_key();
    $rateLimit = admin_check_login_rate_limit($requestKey);

    if (!$rateLimit['allowed']) {
        $errorMessage = 'Too many login attempts. Please try again in about ' . max(1, (int) ceil($rateLimit['retry_after'] / 60)) . ' minute(s).';
    } elseif (!admin_validate_csrf_token($_POST['csrf_token'] ?? null)) {
        $errorMessage = 'Your login session expired. Refresh the page and try again.';
    } elseif (!admin_is_auth_configured()) {
        $errorMessage = 'Admin auth is not configured on the server yet.';
    } else {
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $password = (string) ($_POST['password'] ?? '');

        if ($email === '' || $password === '') {
            $errorMessage = 'Email and password are both required.';
        } else {
            $user = admin_attempt_login($email, $password);

            if ($user === null) {
                $failure = admin_record_login_failure($requestKey);
                $errorMessage = $failure['allowed']
                    ? 'Invalid credentials.'
                    : 'Too many login attempts. Please try again later.';
            } else {
                admin_clear_login_failures($requestKey);
                admin_complete_login($user);
                admin_redirect('/admin/index.php');
            }
        }
    }
}

admin_render_shell_start('Admin Sign-In', [
    'description' => 'Protected access for private NAiERM submissions, survey responses, contacts, and feedback.',
]);
?>
  <section class="admin-grid" style="max-width: 720px; margin: 0 auto;">
    <div class="admin-panel">
      <div class="admin-panel__header">
        <h1 class="admin-panel__title">Admin Sign-In</h1>
        <p class="admin-panel__description">
          Enter your admin email and password to review private survey and simulator submissions.
        </p>
      </div>
      <div class="admin-panel__body">
        <?php if ($errorMessage !== null): ?>
          <div class="admin-alert admin-alert--error"><?= admin_escape($errorMessage) ?></div>
        <?php endif; ?>

        <?php if ($successMessage !== null): ?>
          <div class="admin-alert admin-alert--success"><?= admin_escape($successMessage) ?></div>
        <?php endif; ?>

        <?php if ($configWarning !== null): ?>
          <div class="admin-alert admin-alert--warning"><?= admin_escape($configWarning) ?></div>
        <?php endif; ?>

        <form class="admin-form" method="post" action="/admin/login/index.php">
          <input type="hidden" name="csrf_token" value="<?= admin_escape(admin_get_csrf_token()) ?>">

          <div class="admin-form__row">
            <div class="admin-field">
              <label for="admin-email">Admin email</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autocomplete="username"
                value="<?= admin_escape((string) ($_POST['email'] ?? '')) ?>"
                required
              >
            </div>
            <div class="admin-field">
              <label for="admin-password">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
              >
            </div>
          </div>

          <div class="admin-inline-actions">
            <button type="submit" class="admin-button">Sign In</button>
            <a href="/" class="admin-button--secondary">Back to Public Site</a>
          </div>
        </form>
      </div>
    </div>
  </section>
<?php
admin_render_shell_end();
