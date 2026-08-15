# Pi Agent extensions

Bu dosya, default Pi kurulumunda bulunması gereken extension'ların kanonik
envanteridir. Sürümler 15 Ağustos 2026'da bu Mac'teki kurulumdan alınmıştır.

## npm extension'ları

Yeni bilgisayarda şu sürümleri kurun:

```bash
pi install npm:pi-subagents@0.49.0
pi install npm:@juicesharp/rpiv-ask-user-question@2.5.1
pi install npm:@hk_net/pi-thinking-command@0.1.7
pi install npm:pi-web-access@0.23.0
pi install npm:pi-mcp-adapter@2.26.0
pi install npm:@juicesharp/rpiv-todo@2.2.0
pi install npm:@dietrichgebert/ponytail@4.9.0
pi install npm:@ff-labs/pi-fff@0.10.3
pi install npm:@howaboua/pi-codex-conversion@3.0.14
```

| Paket | Kullanım alanı |
|---|---|
| `pi-subagents` | Alt agent çalıştırma ve yönetimi |
| `@juicesharp/rpiv-ask-user-question` | Kullanıcıya yapılandırılmış soru sorma |
| `@hk_net/pi-thinking-command` | Thinking düzeyini komutla değiştirme |
| `pi-web-access` | Web erişim araçları |
| `pi-mcp-adapter` | MCP sunucularını Pi araçlarına bağlama |
| `@juicesharp/rpiv-todo` | Çok adımlı işlerin görünür durum listesi |
| `@dietrichgebert/ponytail` | Orantılı çözüm ve aşırı mühendislik kontrolü |
| `@ff-labs/pi-fff` | Hızlı dosya araçları ve `@` tamamlama |
| `@howaboua/pi-codex-conversion` | Codex aboneliğiyle toggle dikte |

Kurulumdan sonra `pi list` ile bu dokuz paketi ve sürümlerini doğrulayın.

## Default: rpiv-todo

`@juicesharp/rpiv-todo@2.2.0` kanonik defaulttur. Çok adımlı işlerde agent'ın
planını, aktif adımı ve tamamlananları editörün üzerinde görünür tutar.

Kullanılmadığı basit işlerde Todo açılması gerekmez. Görsel yük üretirse veya
`/reload` ve compaction sonrasında yanlış durum gösterirse yeniden
değerlendirilir.

## Default: Ponytail

`@dietrichgebert/ponytail@4.9.0` kanonik defaulttur. Varsayılan modu `lite`tır.
Taşınabilir exact yapılandırma [`config/ponytail.json`](config/ponytail.json)
içindedir ve `~/.config/ponytail/config.json` yoluna kurulur:

```json
{
  "defaultMode": "lite"
}
```

Ponytail'den beklenen yalnızca daha az kod yazması değildir. Beklenen çalışma
tarzı şudur:

- Gerçek ihtiyacı karşılayan en küçük yeterli çözümü seçmek; kısa mesafe için
  ağır altyapı kurmamak.
- Yerel bir arızada bütün sistemi yeniden yazmamak; en küçük doğru ve ortak
  sorumluluk noktasını düzeltmek.
- Gerçekten aynı yere giden akışları ortak bir gövdede birleştirip yalnız
  gerekli farklılıkları ayrı tutmak.
- Bugünkü ürün ve trafik ölçeğine göre tasarlamak; kanıtlanmamış gelecekteki
  hyperscale ihtiyacı için mimari kurmamak.
- Güvenliği somut tehdit ve güven sınırlarına göre orantılı kurmak; güvenlik
  adına ürünün temel kullanılabilirliğini yok etmemek.
- Kullanıcı talebini uç yorumla büyütmemek; kapsamı veya geri dönüş maliyetini
  artıran kararlarda owner'a sormak.
- Aynı engelde kör denemeleri tekrarlamak yerine denenenleri ve gerçek soruyu
  kullanıcıya getirmek.

Kalibrasyon sırasında özellikle şu sapmalar izlenecektir:

- Gerekli bir owner sorusunu atlayıp varsayımla ilerlemesi
- Küçük çözüm adına eksik doğrulama veya yetersiz test bırakması
- Ortaklaştırma adına aslında farklı olan akışları zorla birleştirmesi
- Güvenliği azaltması ya da tersine güvenlik adına kullanıcı deneyimini
  işlevsizleştirmesi
- Açıkça istenen kapsamı YAGNI gerekçesiyle eksik uygulaması

`full` ve `ultra` otomatik default değildir. Ponytail review, doğruluk ve
güvenlik review'unun yerine geçmez.

## Default: pi-fff

`@ff-labs/pi-fff@0.10.3` kanonik defaulttur ve varsayılan `tools-and-ui`
modunda çalışır: FFF tabanlı araçlar ve `@` dosya tamamlama eklenir, Pi'nin
mevcut `find` ve `grep` araçları değiştirilmez. `override` modu kullanılmaz.

Pi'yi repo kökünden başlatın. Home dizininden başlatmak tüm home dizininin
indekslenmesine ve gereksiz CPU kullanımına yol açabilir. Kanonik makine
ayarında `~/.zshrc` içinde `FFF_ENABLE_HOME_SCAN=0` tanımlanarak home scan
kalıcı olarak kapatılır; proje dizinlerinin indekslenmesi devam eder.

Frecency sıralamasının az kullanılan fakat otorite olan dosyaları görünmez
kılmasına izin verilmez; gerektiğinde Pi'nin normal `find` ve `grep` araçları
kullanılmaya devam eder.

## Default: Codex aboneliğiyle dikte

`@howaboua/pi-codex-conversion@3.0.14` Codex abonelik girişi üzerinden dikte
için kanonik defaulttur. Güvenli exact yapılandırma
[`config/pi-codex-conversion.json`](config/pi-codex-conversion.json) içinde
bulunur ve extension kurulduktan sonra `~/.pi/agent/pi-codex-conversion.json`
yoluna kurulur:

```bash
pi install npm:@howaboua/pi-codex-conversion@3.0.14
```

Pi'de `/codex` ekranını açıp şu değerleri seçin:

- General → `Extension mode`: `voice only`
- General → `Provider scope`: `Codex and configured`
- Voice → `Dictation key behavior`: `toggle`
- Audio input/output: `system default`

İlk `/codex voice dictation` çağrısında ses kurulumunu tamamlayın ve her iki
aygıt için de `System default` seçin. Bu seçim makineye özgü aygıt kimliği
sabitlemez.

Önce iTerm2 → Settings → Profiles → Keys altında hem sol hem sağ Option tuşunu
`Normal` bırakın. Bu düzende fiziksel `Control+Option+D`, Pi'ye `Ctrl+D` olarak
ulaşıp oturumu kapatabilir. Option tuşunun genel davranışını değiştirmek yerine
yalnız fiziksel tırnak tuşu için şu global iTerm2 eşlemesini ekleyin:

1. iTerm2 → Settings → Keys → Key Bindings → `+`
2. Keyboard Shortcut alanında kullanılacak fiziksel tırnak tuşuna basın.
3. Action olarak `Send Hex Codes` seçin.
4. Şu değeri girin:

```text
0x1b 0x5b 0x31 0x30 0x30 0x3b 0x37 0x75
```

Bu dizi Pi'ye `Ctrl+Alt+D` sinyali gönderir. `pi-codex-conversion.json`
içindeki karşılık `dictationShortcut: "ctrl+alt+d"` ve
`dictationShortcutMode: "toggle"` olarak kalır. `/reload` sonrasında tırnak
tuşuna ilk basış dikteyi başlatır, ikinci basış durdurup yazıya çevirir. Global
iTerm2 eşlemesi normal tırnak girişini iTerm2 genelinde devre dışı bırakır;
gerçek F tuşları ve medya/ses kontrolleri değişmez.

### Ghostty / CMUX: Türkçe ISO tırnak tuşu

Ghostty veya Ghostty altyapısını kullanan CMUX için
`~/.config/ghostty/config.ghostty` dosyasına şu satırı ekleyin:

```text
# Esc'in hemen sağındaki, normal basışta `"` üreten Türkçe ISO tuşu.
keybind = "=csi:100;7u
```

Bu, Pi'ye `Ctrl+Alt+D` karşılığı olan terminal dizisini gönderir. Ghostty'de
bir kez `⌘⇧,` ile ayarı yenileyin; ardından aynı tuş dikteyi açıp kapatır.
Tuş Ghostty/CMUX içinde artık normal çift tırnak yazmaz. Fiziksel tuş adıyla
değil üretilen `"` karakteriyle eşlenir; bu ayrım Türkçe klavye düzeninde
gereklidir.

## Kurulu olmayan adaylar

### Ayrı kontrollü deneme: pi-fabric

[`pi-fabric`](https://pi.dev/packages/pi-fabric) henüz kurulu değildir. Mevcut
pilotlardan ayrı bir oturumda denenmesi planlanmaktadır; çünkü kendi agent
runtime'ı, workflow'ları ve dashboard'u `pi-subagents` ile aynı problem alanına
girer.

İlk deneme `fullCodeMode: false` ile orchestration-only modunda yapılmalıdır.
Bu modda Pi'nin normal dosya ve shell araçları korunurken Fabric'in agent,
workflow ve dashboard yüzeyi sınanır. Aynı denemede başka bir subagent
orkestratörü kullanılmamalıdır; aksi halde sonucu hangi sistemin ürettiği
anlaşılamaz.

Denemede özellikle şunlar gözlenecektir:

- Main'in ve çalışan agent'ların anlaşılır ilerleme bilgisi vermesi
- Agent transcript'inde geçmişe gidilebilmesi
- Main üzerinden steer, takip mesajı ve stop işlemlerinin güvenilir çalışması
- Agent sorularının kullanıcıya Main üzerinden ulaşması
- `/reload`, uzun context ve compaction sonrasında kontrolün kaybolmaması
- Basit görevlerde gereksiz orchestration başlatmaması

Fabric kutudan çıktığı haliyle gelişmiş workflow'ları kendiliğinden başlatmaz;
kullanıcı `/skill:fabric-*` çağrısı yapar. Deneme başarılı olursa, çok sayıdaki
komutu ezberletmemek için tek bir kısa giriş komutu değerlendirilir. Bu katman
gerçek kullanım görülmeden geliştirilmez.

### Yedek aday: pi-powerline-footer

[`pi-powerline-footer`](https://pi.dev/packages/pi-powerline-footer) henüz
kurulu değildir. Default Pi footer mevcut ihtiyacın çoğunu karşıladığı için
şimdilik yedek adaydır. Daha görünür context uyarısı, ayrıntılı Git durumu,
compaction sırasında dosya tabanlı mesaj kuyruğu veya prompt stash ihtiyacı
doğarsa kontrollü olarak denenebilir.

İlk denemede `minimal` preset, kapalı welcome overlay ve kapalı Working Vibes
kullanılmalıdır. Paket subagent transcript'i, steer veya açıklamalı ilerleme
sağlamadığından agent gözlemlenebilirliği çözümü olarak değerlendirilmez.

### Bekleme listesi: context-mode

[`context-mode`](https://pi.dev/packages/context-mode) henüz kurulu değildir.
Context tasarrufu ve compaction devamlılığı hedefleri değerlidir; ancak
`1.0.169` sürümünde Pi sub-context sonrasında `/reload` işleminin MCP yardımcı
süreçleri bırakabildiğine ilişkin açık hata bulunduğundan bekleme listesindedir.
Bu hata düzeltilip daha yeni bir sürüm yayımlanmadan pilot yapılmaz. Araç
yönlendirmesini ve sandbox davranışını değiştirdiği için ilerideki denemesi de
diğer pilotlardan ayrı yürütülmelidir.

## Dosya tabanlı extension ve özel agent durumu

Default kurulumda:

- `~/.pi/agent/extensions/` altında özel `.ts` extension yoktur.
- `~/.pi/agent/agents/` altında özel agent yoktur.
- `hospital-spec.ts` ve `web-search.ts` kurulu değildir.
- Hospital'ın on iki `workflow-*.md` agent'ı kurulu değildir.

Eski bir bilgisayarı bu defaulta geçirirken Hospital kurulumu varsa
`hospital-spec.ts`, aşağıdaki agent'lar ve `~/.pi/agent/state/hospital-spec/`
kaldırılmalıdır:

```text
workflow-groundwork.md
workflow-evidence.md
workflow-to-spec.md
workflow-commit.md
workflow-adversarial-spec.md
workflow-spec-readiness.md
workflow-consult.md
workflow-implement.md
workflow-implementation-review.md
workflow-diff-review.md
workflow-pr.md
workflow-pr-review.md
```

Silmeden önce hedeflerin gerçekten Hospital kurulumuna ait olduğunu kontrol
edin ve mümkünse kalıcı silme yerine sistem Çöp'ünü kullanın.

`pi-workflow/` repoda kalır, ancak deneysel/gelecekte geliştirilebilecek ayrı
bir sistemdir; default kurulum komutlarına dahil değildir.

Oturum, state veya `auth.json` dosyalarını başka bilgisayara kopyalamayın.
