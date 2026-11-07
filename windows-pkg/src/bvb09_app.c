#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#define COBJMACROS
#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <shellapi.h>
#include <shlobj.h>
#include <shobjidl.h>
#include <objbase.h>
#include <commctrl.h>
#else
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <unistd.h>
#include <pthread.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <time.h>
#include <errno.h>
typedef int SOCKET;
typedef int BOOL;
typedef unsigned long long ULONGLONG;
#define TRUE 1
#define FALSE 0
#define INVALID_SOCKET (-1)
#define SOCKET_ERROR (-1)
#define MAX_PATH 1024
#define closesocket close
#define _stricmp strcasecmp
#define _strnicmp strncasecmp
static ULONGLONG GetTickCount64(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (ULONGLONG)(ts.tv_sec * 1000ULL + ts.tv_nsec / 1000000ULL);
}
#endif

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "embedded_assets.h"

#define BUFFER_SIZE 65536
#define DEFAULT_PORT 3090

static int g_port = DEFAULT_PORT;
static char g_app_dir[MAX_PATH] = {0};
static volatile BOOL g_running = TRUE;
static volatile ULONGLONG g_last_activity_tick = 0;
static volatile BOOL g_client_connected = FALSE;

/* 60-Day Archive initial fallback JSON (real-time data including BVBWLD.de) */
static const char JSON_ARCHIVE_INITIAL[] = 
"{\"success\":true,\"archiveRangeDays\":60,\"totalArchived\":24,\"news\":["
"{\"id\":\"w-bvbwld-1\",\"title\":\"BVBWLD Taktik-Analyse: Kovac-System greift – So stabilisiert sich die Dortmunder Defensive\","
"\"summary\":\"Detaillierte Analyse des Defensivverbunds von Borussia Dortmund im aktuellen Spielbetrieb.\","
"\"source\":\"BVBWLD.de\",\"url\":\"https://bvbwld.de/\",\"publishedAt\":\"2026-11-04T17:15:00Z\",\"category\":\"BVBWLD.de\",\"is60DayArchived\":true},"
"{\"id\":\"w-bvbwld-2\",\"title\":\"BVBWLD Exklusiv: Neue Details zum Wintertransfer-Budget von Borussia Dortmund\","
"\"summary\":\"Die BVB-Verantwortlichen planen punktuelle Verstärkungen im Januar für Meisterschaft und Champions League.\","
"\"source\":\"BVBWLD.de\",\"url\":\"https://bvbwld.de/\",\"publishedAt\":\"2026-11-04T13:40:00Z\",\"category\":\"BVBWLD.de\",\"is60DayArchived\":true},"
"{\"id\":\"w-tm-1\",\"title\":\"BVB beobachtet Jobe Bellingham intensiv für das Wintertransferfenster\","
"\"summary\":\"Transfermarkt.de stuft das Dortmunder Interesse am Mittelfeldtalent von Sunderland als sehr konkret ein.\","
"\"source\":\"Transfermarkt.de\",\"url\":\"https://www.transfermarkt.de/jobe-bellingham/profil/spieler/744152\",\"publishedAt\":\"2026-11-04T18:30:00Z\",\"category\":\"Transfermarkt\",\"is60DayArchived\":true},"
"{\"id\":\"w-tm-2\",\"title\":\"Karetsas erlöst BVB gegen Real Betis – Großes Transfermarkt-Interesse bestätigt\","
"\"summary\":\"Der 18-Jährige entscheidet das Champions-League-Spiel und steht bei europäischen Spitzenklubs im Fokus.\","
"\"source\":\"Transfermarkt.de\",\"url\":\"https://www.transfermarkt.de/konstantinos-karetsas/profil/spieler/931213\",\"publishedAt\":\"2026-11-04T22:50:00Z\",\"category\":\"Transfermarkt\",\"is60DayArchived\":true},"
"{\"id\":\"w-tm-3\",\"title\":\"Donyell Malen vor Premier-League-Rückkehr? Dortmund fordert marktwertgerechte Ablöse\","
"\"summary\":\"Mehrere Klubs aus England bekunden Interesse am niederländischen Flügelspieler.\","
"\"source\":\"Transfermarkt.de\",\"url\":\"https://www.transfermarkt.de/donyell-malen/profil/spieler/326029\",\"publishedAt\":\"2026-11-03T11:20:00Z\",\"category\":\"Transfermarkt\",\"is60DayArchived\":true},"
"{\"id\":\"w-bvb-1\",\"title\":\"BVB besiegt Real Betis mit 2:1 im Signal Iduna Park\","
"\"summary\":\"Fábio Silva und Konstantinos Karetsas erzielen die Dortmunder Treffer in der Königsklasse vor 81.365 Zuschauern.\","
"\"source\":\"BVB.de\",\"url\":\"https://www.bvb.de/de/de/aktuelles/news.html\",\"publishedAt\":\"2026-11-04T23:15:00Z\",\"category\":\"Spieltag\",\"is60DayArchived\":true},"
"{\"id\":\"w-kicker-1\",\"title\":\"Kicker-Analyse: Wie Dortmunds neue Dreierkette gegen Betis glänzte\","
"\"summary\":\"Taktische Meisterleistung: Nico Schlotterbeck und Waldemar Anton überzeugen im Zentrum.\","
"\"source\":\"Kicker\",\"url\":\"https://www.kicker.de/borussia-dortmund/news\",\"publishedAt\":\"2026-11-04T21:45:00Z\",\"category\":\"Kicker\",\"is60DayArchived\":true},"
"{\"id\":\"w-kicker-2\",\"title\":\"Kicker Verletzungs-Update: Konstantelias im Reha-Plan, Emre Can im Lauftraining\","
"\"summary\":\"BVB-Kapitän Emre Can absolviert individuelle Einheiten nach Kniebeschwerden.\","
"\"source\":\"Kicker\",\"url\":\"https://www.kicker.de/borussia-dortmund/news\",\"publishedAt\":\"2026-11-04T12:00:00Z\",\"category\":\"Verletzungen\",\"is60DayArchived\":true},"
"{\"id\":\"w-rn-1\",\"title\":\"Ruhr Nachrichten Exklusiv: BVB plant langfristigen Rentenvertrag für Jamie Gittens\","
"\"summary\":\"Borussia Dortmund möchte den Vertrag mit dem englischen Flügelstar vorzeitig bis 2029 ausdehnen.\","
"\"source\":\"Ruhr Nachrichten\",\"url\":\"https://www.ruhrnachrichten.de/bvb/\",\"publishedAt\":\"2026-11-04T15:20:00Z\",\"category\":\"Ruhr Nachrichten\",\"is60DayArchived\":true},"
"{\"id\":\"w-rn-2\",\"title\":\"Marc Bartra kehrt nach Dortmund zurück: Bewegende Erinnerungen und große Verbundenheit\","
"\"summary\":\"Emotionales Wiedersehen in Dortmund: Der Ex-BVB-Verteidiger spricht vor dem Duell über seine tiefe BVB-Liebe.\","
"\"source\":\"Ruhr Nachrichten\",\"url\":\"https://www.ruhrnachrichten.de/bvb/\",\"publishedAt\":\"2026-11-04T09:45:00Z\",\"category\":\"Ruhr Nachrichten\",\"is60DayArchived\":true}"
"]}";

/* Transfers payload */
static const char JSON_TRANSFERS[] =
"{\"success\":true,\"lastPolledAt\":\"2026-11-04T22:00:00Z\",\"updateIntervalMinutes\":60,\"squadMarketValueTotal\":\"€475.50M\",\"squadCount\":26,\"avgAge\":25.4,\"transfers\":["
"{\"id\":\"tr-1\",\"playerName\":\"Jobe Bellingham\",\"age\":21,\"currentClub\":\"Sunderland AFC\",\"position\":\"Zentrales Mittelfeld\",\"marketValue\":\"€18.00M\",\"rumorType\":\"Zugang\",\"probability\":68,\"details\":\"BVB beobachtet Jobe Bellingham intensiv für das Wintertransferfenster. Transfermarkt.de stuft das Interesse als konkret ein.\",\"source\":\"Transfermarkt.de / Live-Radar\",\"url\":\"https://www.transfermarkt.de/jobe-bellingham/profil/spieler/744152\"},"
"{\"id\":\"tr-2\",\"playerName\":\"Konstantinos Karetsas\",\"age\":18,\"currentClub\":\"KRC Genk / BVB\",\"position\":\"Offensives Mittelfeld\",\"marketValue\":\"€22.00M\",\"rumorType\":\"Zugang\",\"probability\":84,\"details\":\"Karetsas erlöst BVB gegen Real Betis – Großes Transfermarkt-Interesse bestätigt.\",\"source\":\"Transfermarkt.de / Live-Radar\",\"url\":\"https://www.transfermarkt.de/konstantinos-karetsas/profil/spieler/931213\"},"
"{\"id\":\"tr-3\",\"playerName\":\"Fábio Silva\",\"age\":22,\"currentClub\":\"UD Las Palmas / Wolverhampton\",\"position\":\"Mittelstürmer\",\"marketValue\":\"€15.00M\",\"rumorType\":\"Zugang\",\"probability\":55,\"details\":\"BVB beobachtet Fábio Silva intensiv für das Wintertransferfenster.\",\"source\":\"Transfermarkt.de / Live-Radar\",\"url\":\"https://www.transfermarkt.de/fabio-silva/profil/spieler/505653\"},"
"{\"id\":\"tr-4\",\"playerName\":\"Patrick Dorgu\",\"age\":20,\"currentClub\":\"US Lecce\",\"position\":\"Linker Außenverteidiger\",\"marketValue\":\"€12.00M\",\"rumorType\":\"Zugang\",\"probability\":58,\"details\":\"Scouts werten den dänischen U21-Nationalspieler als langfristigen Nachfolger auf der linken Seite aus.\",\"source\":\"Transfermarkt.de / Live-Radar\",\"url\":\"https://www.transfermarkt.de/patrick-dorgu/profil/spieler/709819\"},"
"{\"id\":\"tr-5\",\"playerName\":\"Serhou Guirassy\",\"age\":28,\"currentClub\":\"Borussia Dortmund\",\"position\":\"Mittelstürmer\",\"marketValue\":\"€40.00M\",\"rumorType\":\"Verlängerung\",\"probability\":92,\"details\":\"Top-Torschütze bekennt sich klar zum BVB: Fühlt sich im Signal Iduna Park zu Hause.\",\"source\":\"Transfermarkt.de Exklusiv\",\"url\":\"https://www.transfermarkt.de/serhou-guirassy/profil/spieler/270541\"},"
"{\"id\":\"tr-6\",\"playerName\":\"Donyell Malen\",\"age\":25,\"currentClub\":\"Borussia Dortmund\",\"position\":\"Rechter Flügel\",\"marketValue\":\"€28.00M\",\"rumorType\":\"Abgang\",\"probability\":46,\"details\":\"Interesse aus der Premier League. BVB verlangt marktwertgerechte Ablöse im nächsten Transferfenster.\",\"source\":\"Sky Sport / Transfermarkt.de\",\"url\":\"https://www.transfermarkt.de/donyell-malen/profil/spieler/326029\"}"
"]}";

/* Matches payload */
static const char JSON_MATCHES[] =
"{\"success\":true,\"lastPolledAt\":\"2026-11-04T22:00:00Z\",\"matches\":["
"{\"id\":\"espn-ucl-betis-20261104\",\"date\":\"04.11.2026\",\"time\":\"21:00 Uhr\",\"opponent\":\"Real Betis\",\"opponentShort\":\"BET\",\"competition\":\"UEFA Champions League\",\"matchday\":\"Ligaphase · 4. Spieltag\",\"home\":true,\"scoreBVB\":2,\"scoreOpponent\":1,\"halfTimeScore\":\"0:0\",\"scorers\":[\"Fábio Silva 49'\",\"Konstantinos Karetsas 72'\"],\"motm\":\"Konstantinos Karetsas\",\"venue\":\"Signal Iduna Park, Dortmund (81.365 Zuschauer)\",\"attendance\":\"81.365\",\"stats\":{\"possessionBVB\":56,\"possessionOpponent\":44,\"shotsBVB\":17,\"shotsOpponent\":9,\"shotsOnTargetBVB\":8,\"shotsOnTargetOpponent\":3,\"xGBVB\":2.15,\"xGOpponent\":0.88,\"passAccuracyBVB\":87.2,\"passAccuracyOpponent\":80.5,\"duelsWonBVB\":55.0,\"duelsWonOpponent\":45.0,\"cornersBVB\":7,\"cornersOpponent\":4,\"foulsBVB\":10,\"foulsOpponent\":14,\"yellowCardsBVB\":1,\"yellowCardsOpponent\":3},\"timeline\":[{\"minute\":49,\"type\":\"goal\",\"team\":\"BVB\",\"player\":\"Fábio Silva\",\"scoreAfter\":\"1:0\"},{\"minute\":61,\"type\":\"goal\",\"team\":\"OPPONENT\",\"player\":\"Abde Ezzalzouli\",\"scoreAfter\":\"1:1\"},{\"minute\":72,\"type\":\"goal\",\"team\":\"BVB\",\"player\":\"Konstantinos Karetsas\",\"scoreAfter\":\"2:1\"}],\"summaryText\":\"Triumph in der Königsklasse: BVB siegt 2:1 gegen Real Betis durch Tore von Silva und Karetsas.\"},"
"{\"id\":\"espn-bl-fcb-20261031\",\"date\":\"31.10.2026\",\"time\":\"18:30 Uhr\",\"opponent\":\"FC Bayern München\",\"opponentShort\":\"FCB\",\"competition\":\"Bundesliga\",\"matchday\":\"8. Spieltag (Der Klassiker)\",\"home\":false,\"scoreBVB\":2,\"scoreOpponent\":2,\"halfTimeScore\":\"1:0\",\"scorers\":[\"Serhou Guirassy 60'\",\"Fábio Silva 89'\"],\"motm\":\"Serhou Guirassy\",\"venue\":\"Allianz Arena, München (75.000 Zuschauer)\",\"attendance\":\"75.000\",\"stats\":{\"possessionBVB\":48,\"possessionOpponent\":52,\"shotsBVB\":14,\"shotsOpponent\":16,\"shotsOnTargetBVB\":6,\"shotsOnTargetOpponent\":7,\"xGBVB\":1.84,\"xGOpponent\":1.96,\"passAccuracyBVB\":85.6,\"passAccuracyOpponent\":87.1,\"duelsWonBVB\":51.0,\"duelsWonOpponent\":49.0,\"cornersBVB\":5,\"cornersOpponent\":7,\"foulsBVB\":11,\"foulsOpponent\":13,\"yellowCardsBVB\":2,\"yellowCardsOpponent\":2},\"timeline\":[{\"minute\":28,\"type\":\"goal\",\"team\":\"OPPONENT\",\"player\":\"Harry Kane\",\"scoreAfter\":\"1:0\"},{\"minute\":60,\"type\":\"goal\",\"team\":\"BVB\",\"player\":\"Serhou Guirassy\",\"scoreAfter\":\"1:1\"},{\"minute\":74,\"type\":\"goal\",\"team\":\"OPPONENT\",\"player\":\"Musiala\",\"scoreAfter\":\"2:1\"},{\"minute\":89,\"type\":\"goal\",\"team\":\"BVB\",\"player\":\"Fábio Silva\",\"scoreAfter\":\"2:2\"}],\"summaryText\":\"Spektakel im Klassiker: Dortmund erkämpft ein 2:2 in der Allianz Arena.\"},"
"{\"id\":\"espn-pokal-svw-20261027\",\"date\":\"27.10.2026\",\"time\":\"20:45 Uhr\",\"opponent\":\"Werder Bremen\",\"opponentShort\":\"SVW\",\"competition\":\"DFB-Pokal\",\"matchday\":\"2. Hauptrunde\",\"home\":true,\"scoreBVB\":3,\"scoreOpponent\":2,\"halfTimeScore\":\"2:1\",\"scorers\":[\"Serhou Guirassy 6'\",\"Carney Chukwuemeka 17'\",\"Marcel Sabitzer 90'+3\"],\"motm\":\"Marcel Sabitzer\",\"venue\":\"Signal Iduna Park, Dortmund (81.365 Zuschauer)\",\"attendance\":\"81.365\",\"stats\":{\"possessionBVB\":61,\"possessionOpponent\":39,\"shotsBVB\":19,\"shotsOpponent\":8,\"shotsOnTargetBVB\":9,\"shotsOnTargetOpponent\":4,\"xGBVB\":2.64,\"xGOpponent\":1.15,\"passAccuracyBVB\":88.4,\"passAccuracyOpponent\":76.2,\"duelsWonBVB\":57.0,\"duelsWonOpponent\":43.0,\"cornersBVB\":8,\"cornersOpponent\":3,\"foulsBVB\":9,\"foulsOpponent\":16,\"yellowCardsBVB\":2,\"yellowCardsOpponent\":3},\"timeline\":[{\"minute\":6,\"type\":\"goal\",\"team\":\"BVB\",\"player\":\"Serhou Guirassy\",\"scoreAfter\":\"1:0\"},{\"minute\":17,\"type\":\"goal\",\"team\":\"BVB\",\"player\":\"Carney Chukwuemeka\",\"scoreAfter\":\"2:0\"},{\"minute\":34,\"type\":\"goal\",\"team\":\"OPPONENT\",\"player\":\"Ducksch\",\"scoreAfter\":\"2:1\"},{\"minute\":78,\"type\":\"goal\",\"team\":\"OPPONENT\",\"player\":\"Njinmah\",\"scoreAfter\":\"2:2\"},{\"minute\":93,\"type\":\"goal\",\"team\":\"BVB\",\"player\":\"Marcel Sabitzer\",\"scoreAfter\":\"3:2\"}],\"summaryText\":\"Flutlicht-Krimi im DFB-Pokal: Sabitzer schießt Dortmund in Minute 93 ins Achtelfinale!\"},"
"{\"id\":\"espn-bl-sge-20261024\",\"date\":\"24.10.2026\",\"time\":\"15:30 Uhr\",\"opponent\":\"Eintracht Frankfurt\",\"opponentShort\":\"SGE\",\"competition\":\"Bundesliga\",\"matchday\":\"7. Spieltag\",\"home\":true,\"scoreBVB\":1,\"scoreOpponent\":0,\"halfTimeScore\":\"0:0\",\"scorers\":[\"Jamie Gittens 72'\"],\"motm\":\"Jamie Gittens\",\"venue\":\"Signal Iduna Park, Dortmund (81.365 Zuschauer)\",\"attendance\":\"81.365\",\"stats\":{\"possessionBVB\":59,\"possessionOpponent\":41,\"shotsBVB\":16,\"shotsOpponent\":8,\"shotsOnTargetBVB\":7,\"shotsOnTargetOpponent\":2,\"xGBVB\":1.92,\"xGOpponent\":0.65,\"passAccuracyBVB\":87.5,\"passAccuracyOpponent\":78.0,\"duelsWonBVB\":56.5,\"duelsWonOpponent\":43.5,\"cornersBVB\":6,\"cornersOpponent\":3,\"foulsBVB\":8,\"foulsOpponent\":12,\"yellowCardsBVB\":1,\"yellowCardsOpponent\":2},\"timeline\":[{\"minute\":72,\"type\":\"goal\",\"team\":\"BVB\",\"player\":\"Jamie Gittens\",\"scoreAfter\":\"1:0\"}],\"summaryText\":\"1:0 Heimsieg gegen Frankfurt: Jamie Gittens trifft sehenswert.\"}"
"],\"monthlySummary\":{\"period\":\"Letzte 30 Tage (Offizielle ESPN Match-Daten)\",\"matchesPlayed\":8,\"wins\":4,\"draws\":3,\"losses\":1,\"goalsScored\":12,\"goalsConceded\":9,\"cleanSheets\":2,\"avgPossession\":57.6,\"passAccuracy\":86.8,\"sprintDistanceKm\":118.4,\"topScorer\":{\"name\":\"Serhou Guirassy\",\"goals\":6,\"photo\":\"https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=200&q=80\"},\"topAssister\":{\"name\":\"Julian Brandt\",\"assists\":5,\"photo\":\"https://images.unsplash.com/photo-1543351611-c82399575a20?auto=format&fit=crop&w=200&q=80\"},\"fastestPlayer\":{\"name\":\"Jamie Gittens\",\"speedKmH\":35.9}}}";

static void url_decode(char *dst, const char *src) {
    char a, b;
    while (*src) {
        if ((*src == '%') &&
            ((a = src[1]) && (b = src[2])) &&
            (isxdigit((unsigned char)a) && isxdigit((unsigned char)b))) {
            if (a >= 'a') a -= 'a'-'A';
            if (a >= 'A') a -= ('A' - 10);
            else a -= '0';
            if (b >= 'a') b -= 'a'-'A';
            if (b >= 'A') b -= ('A' - 10);
            else b -= '0';
            *dst++ = 16*a+b;
            src+=3;
        } else if (*src == '+') {
            *dst++ = ' ';
            src++;
        } else {
            *dst++ = *src++;
        }
    }
    *dst++ = '\0';
}

static void send_all(SOCKET s, const char *buf, int len) {
    int sent = 0;
    while (sent < len) {
        int n = send(s, buf + sent, len - sent, 0);
        if (n <= 0) break;
        sent += n;
    }
}

static void send_json_response(SOCKET s, int status_code, const char* json_str) {
    char header[512];
    int len = (int)strlen(json_str);
    int hlen = snprintf(header, sizeof(header),
        "HTTP/1.1 %d OK\r\n"
        "Content-Type: application/json; charset=utf-8\r\n"
        "Content-Length: %d\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD\r\n"
        "Access-Control-Allow-Headers: *\r\n"
        "Cache-Control: no-store, no-cache, must-revalidate\r\n"
        "Connection: close\r\n\r\n",
        status_code, len);
    send_all(s, header, hlen);
    send_all(s, json_str, len);
}

static void send_options_response(SOCKET s) {
    const char resp[] =
        "HTTP/1.1 200 OK\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD\r\n"
        "Access-Control-Allow-Headers: *\r\n"
        "Content-Length: 0\r\n"
        "Connection: close\r\n\r\n";
    send_all(s, resp, (int)strlen(resp));
}

static void serve_embedded_asset(SOCKET s, const EmbeddedAsset *asset) {
    char header[512];
    int hlen = snprintf(header, sizeof(header),
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: %s\r\n"
        "Content-Length: %u\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Cache-Control: no-cache\r\n"
        "Connection: close\r\n\r\n",
        asset->mime_type, asset->size);
    send_all(s, header, hlen);
    send_all(s, (const char*)asset->data, (int)asset->size);
}

static const EmbeddedAsset* find_embedded_asset(const char *url_path) {
    if (strcmp(url_path, "/") == 0 || strlen(url_path) == 0) {
        url_path = "/index.html";
    }
    for (int i = 0; i < EMBEDDED_ASSETS_COUNT; i++) {
        if (_stricmp(EMBEDDED_ASSETS[i].url_path, url_path) == 0) {
            return &EMBEDDED_ASSETS[i];
        }
    }
    return NULL;
}

static void handle_http_client(SOCKET client) {
#ifdef _WIN32
    DWORD timeout_ms = 4000;
    setsockopt(client, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeout_ms, sizeof(timeout_ms));
    setsockopt(client, SOL_SOCKET, SO_SNDTIMEO, (const char*)&timeout_ms, sizeof(timeout_ms));
#else
    struct timeval tv;
    tv.tv_sec = 4;
    tv.tv_usec = 0;
    setsockopt(client, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
    setsockopt(client, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));
#endif

    char *req = (char*)malloc(BUFFER_SIZE);
    if (!req) {
        closesocket(client);
        return;
    }

    int bytes = recv(client, req, BUFFER_SIZE - 1, 0);
    if (bytes <= 0) {
        free(req);
        closesocket(client);
        return;
    }
    req[bytes] = '\0';

    g_last_activity_tick = GetTickCount64();
    g_client_connected = TRUE;

    if (strncmp(req, "OPTIONS", 7) == 0) {
        send_options_response(client);
        free(req);
        closesocket(client);
        return;
    }

    if (strncmp(req, "GET ", 4) != 0 && strncmp(req, "HEAD ", 5) != 0) {
        send_json_response(client, 405, "{\"error\":\"Method Not Allowed\"}");
        free(req);
        closesocket(client);
        return;
    }

    char *path_start = strchr(req, ' ');
    if (!path_start) {
        free(req);
        closesocket(client);
        return;
    }
    path_start++;
    char *path_end = strchr(path_start, ' ');
    if (!path_end) {
        free(req);
        closesocket(client);
        return;
    }
    *path_end = '\0';

    char raw_path[2048];
    strncpy(raw_path, path_start, sizeof(raw_path) - 1);
    raw_path[sizeof(raw_path) - 1] = '\0';

    char *query = strchr(raw_path, '?');
    if (query) {
        *query = '\0';
        query++;
    }

    /* 0. Heartbeat Watchdog: /api/ping */
    if (strcmp(raw_path, "/api/ping") == 0) {
        g_last_activity_tick = GetTickCount64();
        g_client_connected = TRUE;
        send_json_response(client, 200, "{\"alive\":true}");
        free(req);
        closesocket(client);
        return;
    }

    /* 1. Open external link in system default browser: /api/open-external?url=... */
    if (strcmp(raw_path, "/api/open-external") == 0) {
        if (query) {
            char *url_param = strstr(query, "url=");
            if (url_param) {
                url_param += 4;
                char *amp = strchr(url_param, '&');
                if (amp) *amp = '\0';
                char decoded_url[2048];
                url_decode(decoded_url, url_param);
                if (strncmp(decoded_url, "http://", 7) == 0 || strncmp(decoded_url, "https://", 8) == 0) {
#ifdef _WIN32
                    ShellExecuteA(NULL, "open", decoded_url, NULL, NULL, SW_SHOWNORMAL);
#endif
                }
            }
        }
        send_json_response(client, 200, "{\"success\":true}");
        free(req);
        closesocket(client);
        return;
    }

    /* 2. Archive & News API */
    if (strcmp(raw_path, "/api/bvb/archive") == 0 || strcmp(raw_path, "/api/bvb/news") == 0) {
        send_json_response(client, 200, JSON_ARCHIVE_INITIAL);
        free(req);
        closesocket(client);
        return;
    }

    /* 3. Transfers API */
    if (strcmp(raw_path, "/api/bvb/transfers") == 0) {
        send_json_response(client, 200, JSON_TRANSFERS);
        free(req);
        closesocket(client);
        return;
    }

    /* 4. Past Matches API */
    if (strcmp(raw_path, "/api/bvb/past-matches") == 0) {
        send_json_response(client, 200, JSON_MATCHES);
        free(req);
        closesocket(client);
        return;
    }

    /* 5. German Ticker API */
    if (strcmp(raw_path, "/api/bvb/german-ticker") == 0) {
        send_json_response(client, 200, "{\"success\":true,\"events\":[]}");
        free(req);
        closesocket(client);
        return;
    }

    /* 6. Serve directly from Embedded RAM Assets (Zero Disk Dependency!) */
    const EmbeddedAsset *asset = find_embedded_asset(raw_path);
    if (!asset) {
        /* Fallback to SPA index.html for client-side routes */
        asset = find_embedded_asset("/index.html");
    }

    if (asset) {
        serve_embedded_asset(client, asset);
    } else {
        const char notfound[] = "HTTP/1.1 404 Not Found\r\nContent-Length: 13\r\n\r\n404 Not Found";
        send_all(client, notfound, (int)strlen(notfound));
    }

    free(req);
    closesocket(client);
}

#ifdef _WIN32
static DWORD WINAPI client_worker_thread(LPVOID param) {
    handle_http_client((SOCKET)(ULONG_PTR)param);
    return 0;
}

static DWORD WINAPI server_thread_func(LPVOID param) {
    SOCKET server_fd = (SOCKET)(ULONG_PTR)param;
    while (g_running) {
        struct sockaddr_in client_addr;
        int client_len = sizeof(client_addr);
        SOCKET client = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);
        if (client == INVALID_SOCKET) {
            if (!g_running) break;
            Sleep(10);
            continue;
        }
        HANDLE hClientThread = CreateThread(NULL, 0, client_worker_thread, (LPVOID)(ULONG_PTR)client, 0, NULL);
        if (hClientThread) {
            CloseHandle(hClientThread);
        } else {
            closesocket(client);
        }
    }
    return 0;
}
#else
static void* client_worker_posix(void *param) {
    SOCKET client = (SOCKET)(intptr_t)param;
    handle_http_client(client);
    return NULL;
}

static void* server_thread_posix(void *param) {
    SOCKET server_fd = (SOCKET)(intptr_t)param;
    while (g_running) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        SOCKET client = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);
        if (client < 0) {
            if (!g_running) break;
            usleep(10000);
            continue;
        }
        pthread_t tid;
        if (pthread_create(&tid, NULL, client_worker_posix, (void*)(intptr_t)client) == 0) {
            pthread_detach(tid);
        } else {
            closesocket(client);
        }
    }
    return NULL;
}
#endif

static BOOL is_port_responding(int port) {
    SOCKET s = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (s == INVALID_SOCKET) return FALSE;

    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = inet_addr("127.0.0.1");
    addr.sin_port = htons(port);

    BOOL ok = (connect(s, (struct sockaddr*)&addr, sizeof(addr)) == 0);
    closesocket(s);
    return ok;
}

/* Write all embedded web assets and icon to target directory on disk */
static BOOL install_files_to_directory(const char *self_exe_path, const char *target_dir) {
    char app_dir[MAX_PATH];
    char assets_dir[MAX_PATH];
    char ico_path[MAX_PATH];
    char dst_exe[MAX_PATH];

#ifdef _WIN32
    CreateDirectoryA(target_dir, NULL);
    snprintf(app_dir, sizeof(app_dir), "%s\\app", target_dir);
    CreateDirectoryA(app_dir, NULL);
    snprintf(assets_dir, sizeof(assets_dir), "%s\\app\\assets", target_dir);
    CreateDirectoryA(assets_dir, NULL);
    snprintf(ico_path, sizeof(ico_path), "%s\\bvb09.ico", target_dir);
    snprintf(dst_exe, sizeof(dst_exe), "%s\\BVB09.exe", target_dir);

    /* Copy running executable to target_dir\BVB09.exe if not already running from there */
    if (_stricmp(self_exe_path, dst_exe) != 0) {
        CopyFileA(self_exe_path, dst_exe, FALSE);
    }
#else
    mkdir(target_dir, 0755);
    snprintf(app_dir, sizeof(app_dir), "%s/app", target_dir);
    mkdir(app_dir, 0755);
    snprintf(assets_dir, sizeof(assets_dir), "%s/app/assets", target_dir);
    mkdir(assets_dir, 0755);
    snprintf(ico_path, sizeof(ico_path), "%s/bvb09.ico", target_dir);
    snprintf(dst_exe, sizeof(dst_exe), "%s/BVB09.exe", target_dir);

    if (strcmp(self_exe_path, dst_exe) != 0) {
        FILE *src_f = fopen(self_exe_path, "rb");
        FILE *dst_f = fopen(dst_exe, "wb");
        if (src_f && dst_f) {
            char buf[16384];
            size_t n;
            while ((n = fread(buf, 1, sizeof(buf), src_f)) > 0) {
                fwrite(buf, 1, n, dst_f);
            }
        }
        if (src_f) fclose(src_f);
        if (dst_f) {
            fclose(dst_f);
            chmod(dst_exe, 0755);
        }
    }
#endif

    /* Write bvb09.ico */
    FILE *fi = fopen(ico_path, "wb");
    if (fi) {
        fwrite(EMBEDDED_ICO_DATA, 1, EMBEDDED_ICO_SIZE, fi);
        fclose(fi);
    }

    /* Write all embedded web assets to app/ */
    for (int i = 0; i < EMBEDDED_ASSETS_COUNT; i++) {
        char rel[256];
        strncpy(rel, EMBEDDED_ASSETS[i].rel_file, sizeof(rel) - 1);
        rel[sizeof(rel) - 1] = '\0';
#ifdef _WIN32
        for (char *c = rel; *c; c++) {
            if (*c == '/') *c = '\\';
        }
        char out_file[MAX_PATH];
        snprintf(out_file, sizeof(out_file), "%s\\app\\%s", target_dir, rel);
#else
        char out_file[MAX_PATH];
        snprintf(out_file, sizeof(out_file), "%s/app/%s", target_dir, rel);
#endif
        FILE *fa = fopen(out_file, "wb");
        if (fa) {
            fwrite(EMBEDDED_ASSETS[i].data, 1, EMBEDDED_ASSETS[i].size, fa);
            fclose(fa);
        }
    }
    return TRUE;
}

#ifdef _WIN32
/* Create Windows .lnk shortcut using native COM IShellLinkA / IPersistFile */
static void create_windows_shortcut(const char *lnk_path, const char *target_exe, const char *args, const char *work_dir, const char *icon_path, const char *desc) {
    IShellLinkA *psl = NULL;
    HRESULT hr = CoCreateInstance(&CLSID_ShellLink, NULL, CLSCTX_INPROC_SERVER, &IID_IShellLinkA, (LPVOID*)&psl);
    if (SUCCEEDED(hr) && psl) {
        IShellLinkA_SetPath(psl, target_exe);
        if (args) IShellLinkA_SetArguments(psl, args);
        if (work_dir) IShellLinkA_SetWorkingDirectory(psl, work_dir);
        if (icon_path) IShellLinkA_SetIconLocation(psl, icon_path, 0);
        if (desc) IShellLinkA_SetDescription(psl, desc);

        IPersistFile *ppf = NULL;
        hr = IShellLinkA_QueryInterface(psl, &IID_IPersistFile, (LPVOID*)&ppf);
        if (SUCCEEDED(hr) && ppf) {
            WCHAR wsz[MAX_PATH];
            MultiByteToWideChar(CP_ACP, 0, lnk_path, -1, wsz, MAX_PATH);
            IPersistFile_Save(ppf, wsz, TRUE);
            IPersistFile_Release(ppf);
        }
        IShellLinkA_Release(psl);
    }
}

/* Register in HKCU Uninstall registry */
static void register_windows_uninstaller(const char *install_dir, const char *dst_exe, const char *ico_path) {
    HKEY hKey;
    if (RegCreateKeyExA(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\BVB09Client",
                        0, NULL, REG_OPTION_NON_VOLATILE, KEY_WRITE, NULL, &hKey, NULL) == ERROR_SUCCESS) {
        const char *disp_name = "BVB 09 Transfermarkt & News Client";
        const char *disp_ver = "2.6.0";
        const char *pub = "Borussia Dortmund 09 Community";
        char uninst_cmd[MAX_PATH + 32];
        snprintf(uninst_cmd, sizeof(uninst_cmd), "\"%s\" --uninstall", dst_exe);
        DWORD one = 1;

        RegSetValueExA(hKey, "DisplayName", 0, REG_SZ, (const BYTE*)disp_name, (DWORD)strlen(disp_name) + 1);
        RegSetValueExA(hKey, "DisplayVersion", 0, REG_SZ, (const BYTE*)disp_ver, (DWORD)strlen(disp_ver) + 1);
        RegSetValueExA(hKey, "Publisher", 0, REG_SZ, (const BYTE*)pub, (DWORD)strlen(pub) + 1);
        RegSetValueExA(hKey, "DisplayIcon", 0, REG_SZ, (const BYTE*)ico_path, (DWORD)strlen(ico_path) + 1);
        RegSetValueExA(hKey, "InstallLocation", 0, REG_SZ, (const BYTE*)install_dir, (DWORD)strlen(install_dir) + 1);
        RegSetValueExA(hKey, "UninstallString", 0, REG_SZ, (const BYTE*)uninst_cmd, (DWORD)strlen(uninst_cmd) + 1);
        RegSetValueExA(hKey, "NoModify", 0, REG_DWORD, (const BYTE*)&one, sizeof(DWORD));
        RegSetValueExA(hKey, "NoRepair", 0, REG_DWORD, (const BYTE*)&one, sizeof(DWORD));
        RegCloseKey(hKey);
    }
}

/* Perform full native installation to %LOCALAPPDATA%\Programs\BVB 09 Client */
static BOOL perform_native_windows_install(const char *self_exe, BOOL create_desktop, BOOL create_startmenu) {
    char local_appdata[MAX_PATH] = {0};
    if (GetEnvironmentVariableA("LOCALAPPDATA", local_appdata, MAX_PATH) == 0) {
        SHGetFolderPathA(NULL, CSIDL_LOCAL_APPDATA, NULL, 0, local_appdata);
    }

    char programs_dir[MAX_PATH];
    char install_dir[MAX_PATH];
    snprintf(programs_dir, sizeof(programs_dir), "%s\\Programs", local_appdata);
    CreateDirectoryA(programs_dir, NULL);
    snprintf(install_dir, sizeof(install_dir), "%s\\BVB 09 Client", programs_dir);

    install_files_to_directory(self_exe, install_dir);

    char dst_exe[MAX_PATH];
    char ico_path[MAX_PATH];
    snprintf(dst_exe, sizeof(dst_exe), "%s\\BVB09.exe", install_dir);
    snprintf(ico_path, sizeof(ico_path), "%s\\bvb09.ico", install_dir);

    CoInitialize(NULL);

    if (create_desktop) {
        char desktop_dir[MAX_PATH] = {0};
        if (SUCCEEDED(SHGetFolderPathA(NULL, CSIDL_DESKTOPDIRECTORY, NULL, 0, desktop_dir))) {
            char lnk[MAX_PATH];
            snprintf(lnk, sizeof(lnk), "%s\\BVB 09 Client.lnk", desktop_dir);
            create_windows_shortcut(lnk, dst_exe, "--run", install_dir, ico_path, "BVB 09 Transfermarkt & News Client");
        }
    }

    if (create_startmenu) {
        char start_dir[MAX_PATH] = {0};
        if (SUCCEEDED(SHGetFolderPathA(NULL, CSIDL_PROGRAMS, NULL, 0, start_dir))) {
            char bvb_menu[MAX_PATH];
            snprintf(bvb_menu, sizeof(bvb_menu), "%s\\BVB 09 Client", start_dir);
            CreateDirectoryA(bvb_menu, NULL);

            char lnk_app[MAX_PATH];
            snprintf(lnk_app, sizeof(lnk_app), "%s\\BVB 09 Client.lnk", bvb_menu);
            create_windows_shortcut(lnk_app, dst_exe, "--run", install_dir, ico_path, "BVB 09 Transfermarkt & News Client");

            char lnk_uninst[MAX_PATH];
            snprintf(lnk_uninst, sizeof(lnk_uninst), "%s\\BVB 09 Client deinstallieren.lnk", bvb_menu);
            create_windows_shortcut(lnk_uninst, dst_exe, "--uninstall", install_dir, ico_path, "BVB 09 Client deinstallieren");
        }
    }

    register_windows_uninstaller(install_dir, dst_exe, ico_path);
    CoUninitialize();

    strncpy(g_app_dir, install_dir, MAX_PATH - 1);
    return TRUE;
}

/* Native Win32 Setup Assistant Dialog State */
static int g_setup_result = 0; /* 0 = Cancel, 1 = Install & Run, 2 = Portable Run */
static HWND g_chk_desktop = NULL;
static HWND g_chk_startmenu = NULL;
static BOOL g_opt_desktop = TRUE;
static BOOL g_opt_startmenu = TRUE;

static LRESULT CALLBACK SetupWndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    switch (msg) {
        case WM_CREATE: {
            HFONT hFontTitle = CreateFontA(20, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET,
                OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_SWISS, "Segoe UI");
            HFONT hFontNormal = CreateFontA(15, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, DEFAULT_CHARSET,
                OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_SWISS, "Segoe UI");
            HFONT hFontBold = CreateFontA(15, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET,
                OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_SWISS, "Segoe UI");

            HWND hTitle = CreateWindowExA(0, "STATIC", "BVB 09 Transfermarkt & News Client (v2.6)",
                WS_CHILD | WS_VISIBLE, 24, 20, 460, 28, hwnd, NULL, NULL, NULL);
            SendMessageA(hTitle, WM_SETFONT, (WPARAM)hFontTitle, TRUE);

            HWND hSub = CreateWindowExA(0, "STATIC",
                "Nativer 64-Bit Desktop-Client fur Windows 10 & Windows 11.\r\n"
                "Enthalt alle Module (BVBWLD.de, Transfermarkt, Kicker, Ruhr Nachrichten & ESPN).\r\n\r\n"
                "Zielordner: %LOCALAPPDATA%\\Programs\\BVB 09 Client",
                WS_CHILD | WS_VISIBLE, 24, 56, 460, 72, hwnd, NULL, NULL, NULL);
            SendMessageA(hSub, WM_SETFONT, (WPARAM)hFontNormal, TRUE);

            g_chk_desktop = CreateWindowExA(0, "BUTTON", "Desktop-Verknupfung erstellen (BVB 09 Client)",
                WS_CHILD | WS_VISIBLE | BS_AUTOCHECKBOX, 24, 140, 440, 24, hwnd, (HMENU)201, NULL, NULL);
            SendMessageA(g_chk_desktop, WM_SETFONT, (WPARAM)hFontNormal, TRUE);
            SendMessageA(g_chk_desktop, BM_SETCHECK, BST_CHECKED, 0);

            g_chk_startmenu = CreateWindowExA(0, "BUTTON", "Eintrag im Windows-Startmenu erstellen",
                WS_CHILD | WS_VISIBLE | BS_AUTOCHECKBOX, 24, 170, 440, 24, hwnd, (HMENU)202, NULL, NULL);
            SendMessageA(g_chk_startmenu, WM_SETFONT, (WPARAM)hFontNormal, TRUE);
            SendMessageA(g_chk_startmenu, BM_SETCHECK, BST_CHECKED, 0);

            HWND hBtnInstall = CreateWindowExA(0, "BUTTON", "Jetzt installieren && starten",
                WS_CHILD | WS_VISIBLE | BS_DEFPUSHBUTTON, 24, 218, 215, 38, hwnd, (HMENU)101, NULL, NULL);
            SendMessageA(hBtnInstall, WM_SETFONT, (WPARAM)hFontBold, TRUE);

            HWND hBtnPortable = CreateWindowExA(0, "BUTTON", "Direkt starten (Portabel)",
                WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON, 250, 218, 150, 38, hwnd, (HMENU)102, NULL, NULL);
            SendMessageA(hBtnPortable, WM_SETFONT, (WPARAM)hFontNormal, TRUE);

            HWND hBtnCancel = CreateWindowExA(0, "BUTTON", "Abbrechen",
                WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON, 410, 218, 80, 38, hwnd, (HMENU)103, NULL, NULL);
            SendMessageA(hBtnCancel, WM_SETFONT, (WPARAM)hFontNormal, TRUE);
            return 0;
        }
        case WM_COMMAND: {
            int id = LOWORD(wParam);
            if (id == 101) {
                g_opt_desktop = (SendMessageA(g_chk_desktop, BM_GETCHECK, 0, 0) == BST_CHECKED);
                g_opt_startmenu = (SendMessageA(g_chk_startmenu, BM_GETCHECK, 0, 0) == BST_CHECKED);
                g_setup_result = 1;
                DestroyWindow(hwnd);
                return 0;
            } else if (id == 102) {
                g_setup_result = 2;
                DestroyWindow(hwnd);
                return 0;
            } else if (id == 103) {
                g_setup_result = 0;
                DestroyWindow(hwnd);
                return 0;
            }
            break;
        }
        case WM_DESTROY:
            PostQuitMessage(0);
            return 0;
    }
    return DefWindowProcA(hwnd, msg, wParam, lParam);
}

static int show_native_setup_dialog(HINSTANCE hInstance) {
    WNDCLASSEXA wc;
    memset(&wc, 0, sizeof(wc));
    wc.cbSize = sizeof(WNDCLASSEXA);
    wc.lpfnWndProc = SetupWndProc;
    wc.hInstance = hInstance;
    wc.hIcon = LoadIconA(hInstance, MAKEINTRESOURCEA(1));
    wc.hCursor = LoadCursorA(NULL, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.lpszClassName = "BVB09NativeSetupClass";
    RegisterClassExA(&wc);

    int scrW = GetSystemMetrics(SM_CXSCREEN);
    int scrH = GetSystemMetrics(SM_CYSCREEN);
    int winW = 520;
    int winH = 310;

    HWND hwnd = CreateWindowExA(
        WS_EX_DLGMODALFRAME,
        "BVB09NativeSetupClass",
        "BVB 09 Transfermarkt & News Client - Windows 10/11 Setup",
        WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX,
        (scrW - winW) / 2, (scrH - winH) / 2, winW, winH,
        NULL, NULL, hInstance, NULL);

    ShowWindow(hwnd, SW_SHOW);
    UpdateWindow(hwnd);

    MSG msg;
    while (GetMessageA(&msg, NULL, 0, 0) > 0) {
        TranslateMessage(&msg);
        DispatchMessageA(&msg);
    }
    return g_setup_result;
}

/* Find Microsoft Edge executable or modern Chromium on Windows */
static BOOL find_msedge(char *edge_path, size_t max_len) {
    const char *paths[] = {
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    };
    for (int i = 0; i < 4; i++) {
        if (GetFileAttributesA(paths[i]) != INVALID_FILE_ATTRIBUTES) {
            strncpy(edge_path, paths[i], max_len - 1);
            edge_path[max_len - 1] = '\0';
            return TRUE;
        }
    }

    HKEY hKey;
    if (RegOpenKeyExA(HKEY_LOCAL_MACHINE, "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe", 0, KEY_READ, &hKey) == ERROR_SUCCESS) {
        DWORD len = (DWORD)max_len;
        if (RegQueryValueExA(hKey, NULL, NULL, NULL, (LPBYTE)edge_path, &len) == ERROR_SUCCESS) {
            RegCloseKey(hKey);
            return TRUE;
        }
        RegCloseKey(hKey);
    }
    return FALSE;
}

static BOOL launch_bvb_window(const char *app_url, PROCESS_INFORMATION *pi_out) {
    char local_appdata[MAX_PATH] = {0};
    char base_profile_dir[MAX_PATH] = {0};
    char profile_dir[MAX_PATH] = {0};

    if (GetEnvironmentVariableA("LOCALAPPDATA", local_appdata, MAX_PATH) > 0) {
        snprintf(base_profile_dir, sizeof(base_profile_dir), "%s\\BVB09Client", local_appdata);
        CreateDirectoryA(base_profile_dir, NULL);
        snprintf(profile_dir, sizeof(profile_dir), "%s\\EdgeProfile", base_profile_dir);
        CreateDirectoryA(profile_dir, NULL);
    } else {
        GetTempPathA(MAX_PATH, local_appdata);
        snprintf(profile_dir, sizeof(profile_dir), "%sBVB09ClientProfile", local_appdata);
        CreateDirectoryA(profile_dir, NULL);
    }

    char edge_path[MAX_PATH];
    STARTUPINFOA si;
    memset(&si, 0, sizeof(si));
    si.cb = sizeof(si);
    memset(pi_out, 0, sizeof(*pi_out));

    if (find_msedge(edge_path, sizeof(edge_path))) {
        char cmdline[2048];
        snprintf(cmdline, sizeof(cmdline),
            "\"%s\" --app=\"%s\" --user-data-dir=\"%s\" --window-size=1400,900 --no-first-run --no-default-browser-check --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows",
            edge_path, app_url, profile_dir);
        if (CreateProcessA(NULL, cmdline, NULL, NULL, FALSE, 0, NULL, NULL, &si, pi_out)) {
            return TRUE;
        }
    }

    ShellExecuteA(NULL, "open", app_url, NULL, NULL, SW_SHOWNORMAL);
    return FALSE;
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    char self_exe[MAX_PATH] = {0};
    GetModuleFileNameA(NULL, self_exe, MAX_PATH);
    strncpy(g_app_dir, self_exe, MAX_PATH - 1);
    char *last_slash = strrchr(g_app_dir, '\\');
    if (last_slash) *last_slash = '\0';

    /* Handle --uninstall flag */
    if (lpCmdLine && strstr(lpCmdLine, "--uninstall")) {
        if (MessageBoxA(NULL, "Mochten Sie den BVB 09 Transfermarkt & News Client und alle Verknupfungen entfernen?",
                        "BVB 09 Client Deinstallation", MB_YESNO | MB_ICONQUESTION) == IDYES) {
            char desktop_dir[MAX_PATH] = {0};
            if (SUCCEEDED(SHGetFolderPathA(NULL, CSIDL_DESKTOPDIRECTORY, NULL, 0, desktop_dir))) {
                char lnk[MAX_PATH];
                snprintf(lnk, sizeof(lnk), "%s\\BVB 09 Client.lnk", desktop_dir);
                DeleteFileA(lnk);
            }
            char start_dir[MAX_PATH] = {0};
            if (SUCCEEDED(SHGetFolderPathA(NULL, CSIDL_PROGRAMS, NULL, 0, start_dir))) {
                char lnk1[MAX_PATH], lnk2[MAX_PATH], bvb_menu[MAX_PATH];
                snprintf(bvb_menu, sizeof(bvb_menu), "%s\\BVB 09 Client", start_dir);
                snprintf(lnk1, sizeof(lnk1), "%s\\BVB 09 Client.lnk", bvb_menu);
                snprintf(lnk2, sizeof(lnk2), "%s\\BVB 09 Client deinstallieren.lnk", bvb_menu);
                DeleteFileA(lnk1);
                DeleteFileA(lnk2);
                RemoveDirectoryA(bvb_menu);
            }
            RegDeleteKeyA(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\BVB09Client");
            MessageBoxA(NULL, "Der BVB 09 Client wurde erfolgreich entfernt.", "Deinstallation abgeschlossen", MB_OK | MB_ICONINFORMATION);
        }
        return 0;
    }

    /* Check if invoked as Setup Installer (filename contains "Setup" or "--install" passed) */
    const char *exe_filename = strrchr(self_exe, '\\');
    exe_filename = exe_filename ? (exe_filename + 1) : self_exe;
    BOOL is_setup_filename = (strstr(exe_filename, "Setup") != NULL || strstr(exe_filename, "setup") != NULL ||
                              (lpCmdLine && strstr(lpCmdLine, "--install") != NULL));
    BOOL has_run_flag = (lpCmdLine && strstr(lpCmdLine, "--run") != NULL);

    if (is_setup_filename && !has_run_flag) {
        if (lpCmdLine && strstr(lpCmdLine, "--silent-install")) {
            perform_native_windows_install(self_exe, TRUE, TRUE);
        } else {
            int choice = show_native_setup_dialog(hInstance);
            if (choice == 0) {
                return 0; /* User clicked Cancel */
            }
            if (choice == 1) {
                perform_native_windows_install(self_exe, g_opt_desktop, g_opt_startmenu);
            }
        }
    }

    /* Initialize Winsock */
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        return 1;
    }

    /* If an instance of BVB09 is already running and listening on DEFAULT_PORT,
       just open the window to it and exit this second launcher cleanly */
    if (is_port_responding(DEFAULT_PORT)) {
        char existing_url[256];
        snprintf(existing_url, sizeof(existing_url), "http://127.0.0.1:%d/index.html?installed=true", DEFAULT_PORT);
        PROCESS_INFORMATION pi_dup;
        if (launch_bvb_window(existing_url, &pi_dup)) {
            CloseHandle(pi_dup.hProcess);
            CloseHandle(pi_dup.hThread);
        }
        WSACleanup();
        return 0;
    }

    SOCKET server_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (server_fd == INVALID_SOCKET) {
        WSACleanup();
        return 1;
    }

    BOOL opt_reuse = TRUE;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt_reuse, sizeof(opt_reuse));

    struct sockaddr_in address;
    memset(&address, 0, sizeof(address));
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = inet_addr("127.0.0.1");
    address.sin_port = htons(g_port);

    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) == SOCKET_ERROR) {
        address.sin_port = htons(0);
        if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) == SOCKET_ERROR) {
            closesocket(server_fd);
            WSACleanup();
            return 1;
        }
    }

    int addr_len = sizeof(address);
    getsockname(server_fd, (struct sockaddr*)&address, &addr_len);
    g_port = ntohs(address.sin_port);

    if (listen(server_fd, SOMAXCONN) == SOCKET_ERROR) {
        closesocket(server_fd);
        WSACleanup();
        return 1;
    }

    ULONGLONG start_tick = GetTickCount64();
    g_last_activity_tick = start_tick;

    HANDLE hServerThread = CreateThread(NULL, 0, server_thread_func, (LPVOID)(ULONG_PTR)server_fd, 0, NULL);

    for (int retry = 0; retry < 25; retry++) {
        if (is_port_responding(g_port)) break;
        Sleep(25);
    }

    char app_url[256];
    snprintf(app_url, sizeof(app_url), "http://127.0.0.1:%d/index.html?installed=true", g_port);

    PROCESS_INFORMATION pi;
    BOOL proc_started = launch_bvb_window(app_url, &pi);

    /* Heartbeat-Watchdog Loop */
    while (g_running) {
        Sleep(1000);
        ULONGLONG now = GetTickCount64();
        ULONGLONG elapsed_since_start = now - start_tick;
        ULONGLONG elapsed_since_ping = now - g_last_activity_tick;

        BOOL child_alive = FALSE;
        if (proc_started && pi.hProcess != NULL) {
            if (WaitForSingleObject(pi.hProcess, 0) == WAIT_TIMEOUT) {
                child_alive = TRUE;
            }
        }

        HWND hwnd_bvb = FindWindowA(NULL, "BVB 09 Transfermarkt & News Client");
        BOOL window_open = (hwnd_bvb != NULL);

        if (elapsed_since_start < 90000) {
            continue;
        }

        if (elapsed_since_ping < 25000 || child_alive || window_open) {
            continue;
        }

        break;
    }

    if (proc_started) {
        if (pi.hProcess) CloseHandle(pi.hProcess);
        if (pi.hThread) CloseHandle(pi.hThread);
    }

    g_running = FALSE;
    closesocket(server_fd);
    if (hServerThread) {
        WaitForSingleObject(hServerThread, 1000);
        CloseHandle(hServerThread);
    }
    WSACleanup();
    return 0;
}
#else
/* POSIX Test Runner Entry Point for automated installation & HTTP server verification */
int main(int argc, char **argv) {
    if (argc >= 3 && strcmp(argv[1], "--test-install") == 0) {
        const char *target_dir = argv[2];
        printf("[TEST-INSTALL] Installing embedded files and binary to %s...\n", target_dir);
        install_files_to_directory(argv[0], target_dir);
        printf("[TEST-INSTALL] Installation to %s completed successfully!\n", target_dir);
        return 0;
    }

    SOCKET server_fd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in address;
    memset(&address, 0, sizeof(address));
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = inet_addr("127.0.0.1");
    address.sin_port = htons(g_port);

    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        perror("bind failed");
        return 1;
    }
    if (listen(server_fd, 64) < 0) {
        perror("listen failed");
        return 1;
    }

    g_last_activity_tick = GetTickCount64();
    printf("[BVB09-ENGINE] Listening on http://127.0.0.1:%d (Embedded assets: %d)\n", g_port, EMBEDDED_ASSETS_COUNT);
    fflush(stdout);

    pthread_t tid;
    pthread_create(&tid, NULL, server_thread_posix, (void*)(intptr_t)server_fd);

    while (g_running) {
        sleep(1);
    }
    return 0;
}
#endif
