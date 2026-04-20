<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/_layout.php';

$user = admin_require_login();
$settingsError = null;
$latestConfig = null;
$configHistory = [];

try {
    $pdo = admin_get_pdo();

    $historyStatement = $pdo->query(
        'SELECT id, created_at, is_active, config, note, changed_by
         FROM global_config
         ORDER BY created_at DESC
         LIMIT 20'
    );
    $configHistory = $historyStatement->fetchAll();

    foreach ($configHistory as $row) {
        if (!empty($row['is_active'])) {
            $latestConfig = $row;
            break;
        }
    }

    if ($latestConfig === null && $configHistory !== []) {
        $latestConfig = $configHistory[0];
    }
} catch (Throwable $error) {
    $settingsError = 'Settings history could not be loaded. Confirm the global_config table exists in SiteGround MySQL.';
}

admin_render_shell_start('Settings', [
    'user' => $user,
    'active' => 'settings',
    'description' => 'Review active global config snapshots stored in the SiteGround MySQL bridge.',
]);
?>
  <section class="admin-grid admin-grid--content">
    <div class="admin-panel">
      <div class="admin-panel__header">
        <h1 class="admin-panel__title">Read-Only Settings</h1>
        <p class="admin-panel__description">
          This first SiteGround admin pass is intentionally safe: you can inspect the active simulator defaults here without exposing risky write actions yet.
        </p>
      </div>
      <div class="admin-panel__body">
        <?php if ($settingsError !== null): ?>
          <div class="admin-alert admin-alert--error"><?= admin_escape($settingsError) ?></div>
        <?php endif; ?>

        <?php if (!is_array($latestConfig)): ?>
          <p class="admin-empty">No global config records are stored yet.</p>
        <?php else: ?>
          <div class="admin-statline">
            <span class="admin-chip <?= !empty($latestConfig['is_active']) ? 'admin-chip--good' : '' ?>">
              <?= !empty($latestConfig['is_active']) ? 'Active config' : 'Latest snapshot' ?>
            </span>
            <span class="admin-chip"><?= admin_escape(admin_format_datetime((string) ($latestConfig['created_at'] ?? ''))) ?></span>
            <span class="admin-chip"><?= admin_escape((string) ($latestConfig['changed_by'] ?? 'Unknown editor')) ?></span>
          </div>

          <div class="admin-kv">
            <div class="admin-kv__row">
              <div class="admin-kv__label">Change note</div>
              <div class="admin-kv__value"><?= admin_escape((string) ($latestConfig['note'] ?? 'No note attached.')) ?></div>
            </div>
            <div class="admin-kv__row">
              <div class="admin-kv__label">Record id</div>
              <div class="admin-kv__value"><?= admin_escape((string) ($latestConfig['id'] ?? '')) ?></div>
            </div>
          </div>

          <div style="margin-top: 1rem;">
            <p class="admin-card__label">Config JSON</p>
            <pre class="admin-code"><?= admin_escape(admin_json_pretty(admin_decode_json_field((string) ($latestConfig['config'] ?? '')))) ?></pre>
          </div>
        <?php endif; ?>
      </div>
    </div>

    <div class="admin-panel">
      <div class="admin-panel__header">
        <h2 class="admin-panel__title">Recent Config History</h2>
        <p class="admin-panel__description">Use this timeline to confirm which default assumptions are live.</p>
      </div>
      <div class="admin-panel__body">
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Status</th>
                <th>Changed by</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <?php if ($configHistory === []): ?>
                <tr>
                  <td colspan="4"><p class="admin-empty">No config history available yet.</p></td>
                </tr>
              <?php endif; ?>

              <?php foreach ($configHistory as $entry): ?>
                <tr>
                  <td><?= admin_escape(admin_format_datetime((string) ($entry['created_at'] ?? ''))) ?></td>
                  <td>
                    <span class="admin-chip <?= !empty($entry['is_active']) ? 'admin-chip--good' : '' ?>">
                      <?= !empty($entry['is_active']) ? 'Active' : 'Archived' ?>
                    </span>
                  </td>
                  <td><?= admin_escape((string) ($entry['changed_by'] ?? 'Unknown editor')) ?></td>
                  <td><?= admin_escape((string) ($entry['note'] ?? 'No note attached.')) ?></td>
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

