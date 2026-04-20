<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

function admin_render_shell_start(string $title, array $options = []): void
{
    $user = $options['user'] ?? null;
    $active = (string) ($options['active'] ?? 'dashboard');
    $description = (string) ($options['description'] ?? 'Secure access to private NAiERM submissions and feedback.');
    $csrfToken = admin_get_csrf_token();
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= admin_escape($title) ?> | NAiERM Admin</title>
  <meta name="robots" content="noindex,nofollow">
  <meta name="description" content="<?= admin_escape($description) ?>">
  <link rel="stylesheet" href="/admin/admin.css">
</head>
<body>
  <div class="admin-shell">
    <header class="admin-header">
      <div class="admin-header__inner">
        <div>
          <a class="admin-brand" href="/admin/index.php">NAiERM Admin</a>
          <p class="admin-subtitle">Private SiteGround control room for submissions and research intake.</p>
        </div>
        <?php if (is_array($user)): ?>
          <div class="admin-header__actions">
            <nav class="admin-nav" aria-label="Admin navigation">
              <a href="/admin/index.php" class="<?= $active === 'dashboard' ? 'is-active' : '' ?>">Dashboard</a>
              <a href="/admin/settings/index.php" class="<?= $active === 'settings' ? 'is-active' : '' ?>">Settings</a>
            </nav>
            <div class="admin-user">
              <span><?= admin_escape($user['display_name'] ?? 'Admin') ?></span>
              <span class="admin-user__email"><?= admin_escape($user['email'] ?? '') ?></span>
            </div>
            <form method="post" action="/admin/logout.php">
              <input type="hidden" name="csrf_token" value="<?= admin_escape($csrfToken) ?>">
              <button type="submit" class="admin-link-button">Sign Out</button>
            </form>
          </div>
        <?php endif; ?>
      </div>
    </header>
    <main class="admin-main">
<?php
}

function admin_render_shell_end(): void
{
    ?>
    </main>
  </div>
</body>
</html>
<?php
}
