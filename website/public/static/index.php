<?php

// Any requests from crawlers or unfurls get redirected to this file.
// This means you can render meta tags here on the server side

$_URL = $_SERVER['REQUEST_URI'];
if (strpos($_URL,"?") !== false) $_URL = substr_replace($_URL, "", strpos($_URL, "?"));
if (strpos($_URL,"#") !== false) $_URL = substr_replace($_URL, "", strpos($_URL, "#"));
$args = array_values(array_filter(explode("/", $_URL), function ($e) {
    return $e !== "";
}));



$routes = [
    [
        "url" => "team",
        "also_load" => ["theme", "event"],
        "sub_routes" => [
            ["url" => "matches", "title" => "Matches", "description" => "-"],
            ["url" => "theme", "title" => "Theme", "description" => "-"],
        ],
        "description" => function($thing) {
            if (isset($thing->event)) {
                return $thing->name . ($thing->type_description ? ' - ' . strtolower($thing->type_description) . ' ' : ' from ') . $thing->event->name . ".";
            } else {
                return $thing->name . "'s team profile.";
            }
        }
    ],
    [
        "url" => "event",
        "also_load" => ["theme"],
        "sub_routes" => [
            ["url" => "bracket", "title" => "Bracket", "description" => "-"],
            ["url" => "schedule", "title" => "Schedule", "description" => "-"],
            ["url" => "scenarios", "title" => "Foldy Sheet", "description" => "-"],
        ]
    ],
    [
        "url" => "match",
        "also_load" => ["event"],
        "after_load" => function($thing) {
            $thing->theme = getThing($thing->event->theme[0]);
            $_teams = [];
            foreach ($thing->teams as $teamID) {
                array_push($_teams, getThing($teamID));
            }
            $thing->teams = $_teams;
        },
        "sub_routes" => [""],
        "description" => function($thing) {
            if (count($thing->teams) === 2) {
                return implode(" vs ", array_map(function ($item) { return $item->name; }, $thing->teams)) . " from " . $thing->event->name . ".";
            }
        }
    ],
    [
        "url" => "player",
        "sub_routes" => [
            ["url" => "casts", "text" => "'s casts"],
            ["url" => "matches", "text" => "'s matches"],
            ["url" => "news", "text" => "'s articles"],
            ["url" => "played-matches", "text" => "'s played matches"],
        ],
        "description" => function($thing) {
            return $thing->name . "'s player profile.";
        }
    ],
];

$activeRoute = null;

foreach ($routes as $route) {
    if ($route['url'] === $args[0]) {
        $activeRoute = $route;
    }
}

if (!$activeRoute) {
    // 404
    http_response_code(404);
    die();
}

// processing
$thing = getThing($args[1]);

if (isset($activeRoute["also_load"])) {
    foreach ($activeRoute["also_load"] as $l) {
        $thing->$l = getThing($thing->$l[0]);
    }
//    $thing->theme = getThing($thing->theme[0]);
}
if (isset($activeRoute["after_load"])) {
    $activeRoute["after_load"]($thing);
}

$meta = (object)[
    "title" => " | SLMN.GG",
    "image" => (object)[
        "url" => "https://preds.slmn.io/media/gigabrain-square.png",
        "width" => 450,
        "height" => 450
    ],
    "description" => " \nView this and other SLMN-affiliated events, teams and matches on SLMN.GG",
    "color" => "#111111"
];


$meta->title = $thing->name . $meta->title;

if (isset($args[2]) && isset($activeRoute["sub_routes"])) {
    foreach ($activeRoute["sub_routes"] as $sub_route) {
        if ($sub_route["url"] === $args[2] && isset($sub_route["title"])) {
//             if ($sub_route["plurals"] && isset($thing->$sub_route["plurals"]) && count($thing->$sub_route["plurals"]) > 1) {
//                 $meta->title = $sub_route["title"] . "s | " . $meta->title;
//             } else {
                $meta->title =  $sub_route["title"] . " | " . $meta->title;
//             }
        }
    }
}

if ($thing->theme) {
    $meta->color = $thing->theme->color_theme;
    $meta->image = getThemeLogo($thing->theme);
}

if (isset($activeRoute["description"])) {
    $meta->description = $activeRoute["description"]($thing) . $meta->description;
}

function getThemeLogo($theme) {
    $image_keys = ["default_logo", "default_wordmark", "small_logo"];
    foreach ($image_keys as $key) {
        if (isset($theme->$key) && isset($theme->$key[0])) {
            return $theme->$key[0]->thumbnails->full;
        }
    }
}
function cleanID($id) {
    if (!$id) return null;
    if (substr($id, 0, 3) === "rec" && strlen($id) === 17) {
        $id = substr($id, 3);
    }
    return $id;
}
function getThing($id) {
    $id = cleanID($id);
    $data = fetch("https://data.slmn.gg/thing/" . $id);
    return $data;
}
function fetch($url) {
    return json_decode(file_get_contents($url));
}
?>
<html>
    <head>
        <title><?= $meta->title ?></title>

        <meta property="og:image" content="<?= $meta->image->url ?>" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="<?= $meta->image->width ?>" />
        <meta property="og:image:height" content="<?= $meta->image->height ?>" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:site" content="@slmnio" />
        <meta property="twitter:creator" content="@slmnio" />
        <meta property="twitter:image" content="<?= $meta->image->url ?>" />

        <meta property="og:title" content="<?= $meta->title ?>" />
        <meta property="twitter:title" content="<?= $meta->title ?>" />
        <meta name="apple-mobile-web-app-title" content="<?= $meta->title ?>">
        <meta name="application-name" content="<?= $meta->title ?>">

        <meta property="og:description" content="<?= $meta->description ?>" />
        <meta property="twitter:description" content="<?= $meta->description ?>" />
        <meta name="description" content="<?= $meta->description ?>"/>
        <meta name="msapplication-TileColor" content="<?= $meta->color ?>">
        <meta name="theme-color" content="<?= $meta->color ?>">
    </head>
</html>
