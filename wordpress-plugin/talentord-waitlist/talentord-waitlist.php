<?php
/**
 * Plugin Name: TalentoRD Waitlist
 * Description: Guarda registros de talentos y empresas en una tabla propia y expone endpoints REST para la landing de TalentoRD.
 * Version: 0.1.1
 * Author: TalentoRD
 */

if (!defined('ABSPATH')) {
    exit;
}

define('TALENTORD_WAITLIST_VERSION', '0.1.1');
define('TALENTORD_WAITLIST_TABLE', 'talentord_waitlist');
define('TALENTORD_TALENT_GOAL', 10000);
define('TALENTORD_COMPANY_GOAL', 1000);
define('TALENTORD_TALENT_SEED', 5003);
define('TALENTORD_COMPANY_SEED', 517);

function talentord_waitlist_table_name() {
    global $wpdb;
    return $wpdb->prefix . TALENTORD_WAITLIST_TABLE;
}

function talentord_waitlist_activate() {
    global $wpdb;

    $table_name = talentord_waitlist_table_name();
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE {$table_name} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        type VARCHAR(20) NOT NULL,
        full_name VARCHAR(190) NOT NULL,
        email VARCHAR(190) NOT NULL,
        whatsapp VARCHAR(80) NOT NULL,
        company_name VARCHAR(190) NULL,
        location VARCHAR(190) NULL,
        sector VARCHAR(190) NULL,
        talent_area TEXT NULL,
        experience_level VARCHAR(120) NULL,
        opportunity_type TEXT NULL,
        profile_url TEXT NULL,
        talent_needs TEXT NULL,
        estimated_hires VARCHAR(120) NULL,
        hiring_challenge TEXT NULL,
        message TEXT NULL,
        raw_data LONGTEXT NULL,
        source VARCHAR(120) NOT NULL DEFAULT 'landing',
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY type_created_at (type, created_at),
        KEY email (email)
    ) {$charset_collate};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
}
register_activation_hook(__FILE__, 'talentord_waitlist_activate');

function talentord_waitlist_sanitize_payload($payload) {
    $clean = array();

    foreach ((array) $payload as $key => $value) {
        if (!is_string($key)) {
            continue;
        }

        if (is_array($value)) {
            $clean_key = sanitize_key($key);
            $limit = in_array($clean_key, array('areas', 'dificultad'), true) ? 100 : 10;
            $clean[$clean_key] = array_slice(array_values(array_filter(array_map('sanitize_text_field', $value))), 0, $limit);
            continue;
        }

        if (is_scalar($value)) {
            $clean[sanitize_key($key)] = sanitize_text_field((string) $value);
        }
    }

    return $clean;
}

function talentord_waitlist_required_fields($type) {
    $common = array('nombre', 'correo', 'whatsapp');

    if ($type === 'talento') {
        return array_merge($common, array('ubicacion', 'area', 'experiencia', 'oportunidad', 'aceptacion'));
    }

    return array_merge($common, array('empresa', 'sector', 'areas', 'cantidad', 'dificultad', 'aceptacion'));
}

function talentord_waitlist_validate($type, $data) {
    if (!in_array($type, array('talento', 'empresa'), true)) {
        return new WP_Error('talentord_invalid_type', 'Tipo de registro invalido.', array('status' => 400));
    }

    foreach (talentord_waitlist_required_fields($type) as $field) {
        if (empty($data[$field])) {
            return new WP_Error('talentord_missing_field', 'Registro incompleto.', array('status' => 400));
        }

        if (is_array($data[$field]) && !in_array($field, array('areas', 'dificultad'), true) && count($data[$field]) > 10) {
            return new WP_Error('talentord_too_many_values', 'Selecciona un máximo de 10 opciones.', array('status' => 400));
        }
    }

    if (!is_email($data['correo'])) {
        return new WP_Error('talentord_invalid_email', 'Correo electronico invalido.', array('status' => 400));
    }

    return true;
}

function talentord_waitlist_stats() {
    global $wpdb;

    $table_name = talentord_waitlist_table_name();
    $talent_count = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$table_name} WHERE type = %s", 'talento'));
    $company_count = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$table_name} WHERE type = %s", 'empresa'));

    return array(
        'talento' => array(
            'current' => TALENTORD_TALENT_SEED + $talent_count,
            'goal' => TALENTORD_TALENT_GOAL,
        ),
        'empresa' => array(
            'current' => TALENTORD_COMPANY_SEED + $company_count,
            'goal' => TALENTORD_COMPANY_GOAL,
        ),
    );
}

function talentord_waitlist_insert($type, $data) {
    global $wpdb;

    $table_name = talentord_waitlist_table_name();
    $raw_json = wp_json_encode($data, JSON_UNESCAPED_UNICODE);

    $talent_area = $data['area'] ?? ($data['areas'] ?? null);
    $opportunity_type = $data['oportunidad'] ?? null;
    $talent_needs = $data['areas'] ?? null;

    if (is_array($talent_area)) {
        $talent_area = implode(', ', $talent_area);
    }

    if (is_array($opportunity_type)) {
        $opportunity_type = implode(', ', $opportunity_type);
    }

    if (is_array($talent_needs)) {
        $talent_needs = implode(', ', $talent_needs);
    }

    $hiring_challenge = $data['dificultad'] ?? null;

    if (is_array($hiring_challenge)) {
        $hiring_challenge = implode(', ', $hiring_challenge);
    }

    $row = array(
        'type' => $type,
        'full_name' => $data['nombre'],
        'email' => sanitize_email($data['correo']),
        'whatsapp' => $data['whatsapp'],
        'company_name' => $data['empresa'] ?? null,
        'location' => $data['ubicacion'] ?? null,
        'sector' => $data['sector'] ?? null,
        'talent_area' => $talent_area,
        'experience_level' => $data['experiencia'] ?? null,
        'opportunity_type' => $opportunity_type,
        'profile_url' => !empty($data['perfil']) ? esc_url_raw($data['perfil']) : null,
        'talent_needs' => $talent_needs,
        'estimated_hires' => $data['cantidad'] ?? null,
        'hiring_challenge' => $hiring_challenge,
        'message' => $data['comentario'] ?? ($data['mensaje'] ?? null),
        'raw_data' => $raw_json,
        'source' => 'landing-rest-api',
        'created_at' => current_time('mysql', true),
    );

    $inserted = $wpdb->insert($table_name, $row);

    if (!$inserted) {
        return new WP_Error('talentord_insert_failed', 'No se pudo guardar el registro.', array('status' => 500));
    }

    return (int) $wpdb->insert_id;
}

function talentord_waitlist_register_route(WP_REST_Request $request) {
    $params = $request->get_json_params();
    $type = sanitize_key($params['type'] ?? '');
    $data = talentord_waitlist_sanitize_payload($params['data'] ?? array());
    $valid = talentord_waitlist_validate($type, $data);

    if (is_wp_error($valid)) {
        return $valid;
    }

    $entry_id = talentord_waitlist_insert($type, $data);

    if (is_wp_error($entry_id)) {
        return $entry_id;
    }

    return rest_ensure_response(array(
        'ok' => true,
        'entryId' => $entry_id,
        'stats' => talentord_waitlist_stats(),
    ));
}

function talentord_waitlist_stats_route() {
    return rest_ensure_response(talentord_waitlist_stats());
}

function talentord_waitlist_register_rest_routes() {
    register_rest_route('talentord/v1', '/register', array(
        'methods' => 'POST',
        'callback' => 'talentord_waitlist_register_route',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('talentord/v1', '/stats', array(
        'methods' => 'GET',
        'callback' => 'talentord_waitlist_stats_route',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'talentord_waitlist_register_rest_routes');

function talentord_waitlist_admin_menu() {
    add_menu_page(
        'TalentoRD Waitlist',
        'TalentoRD',
        'manage_options',
        'talentord-waitlist',
        'talentord_waitlist_admin_page',
        'dashicons-groups',
        26
    );
}
add_action('admin_menu', 'talentord_waitlist_admin_menu');

function talentord_waitlist_admin_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    global $wpdb;
    $table_name = talentord_waitlist_table_name();
    $stats = talentord_waitlist_stats();
    $rows = $wpdb->get_results("SELECT id, type, full_name, email, whatsapp, company_name, talent_area, created_at FROM {$table_name} ORDER BY created_at DESC LIMIT 100");
    ?>
    <div class="wrap">
        <h1>TalentoRD Waitlist</h1>
        <p><strong>Talentos:</strong> <?php echo esc_html(number_format_i18n($stats['talento']['current'])); ?> / <?php echo esc_html(number_format_i18n($stats['talento']['goal'])); ?></p>
        <p><strong>Empresas:</strong> <?php echo esc_html(number_format_i18n($stats['empresa']['current'])); ?> / <?php echo esc_html(number_format_i18n($stats['empresa']['goal'])); ?></p>
        <table class="widefat striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>WhatsApp</th>
                    <th>Empresa</th>
                    <th>Area</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($rows as $row) : ?>
                    <tr>
                        <td><?php echo esc_html($row->id); ?></td>
                        <td><?php echo esc_html($row->type); ?></td>
                        <td><?php echo esc_html($row->full_name); ?></td>
                        <td><?php echo esc_html($row->email); ?></td>
                        <td><?php echo esc_html($row->whatsapp); ?></td>
                        <td><?php echo esc_html($row->company_name); ?></td>
                        <td><?php echo esc_html($row->talent_area); ?></td>
                        <td><?php echo esc_html($row->created_at); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php
}
