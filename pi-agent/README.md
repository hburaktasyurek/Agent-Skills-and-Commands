# Pi Agent

Bu klasör, kişisel Pi Agent kurulumunun **kanonik/default** envanteridir.
Yeni bir bilgisayarda Pi kurulurken bu bilgisayardaki düzeni yeniden üretmek
için kullanılır.

Referans durum 18 Ağustos 2026'da bu Mac'ten alınmıştır. Parolalar, API
anahtarları, OAuth oturumları, sohbet geçmişi ve runtime state bu repoda
tutulmaz.

## Default kurulum

Önkoşullar: Node.js/npm ve Git.

```bash
npm install --global @earendil-works/pi-coding-agent@0.84.2
pi --version
```

Beklenen Pi sürümü: `0.84.2`.

Sonra, sırayla:

1. [EXTENSIONS.md](EXTENSIONS.md) içindeki on npm paketini kurun.
2. Pi'de `openai-codex` ve `opencode-go` hesaplarına giriş yapın.
3. [`config/settings.json`](config/settings.json) içindeki güvenli kanonik
   değerleri mevcut `~/.pi/agent/settings.json` dosyasına birleştirin.
4. Codex Voice ve Ponytail yapılandırmalarını [EXTENSIONS.md](EXTENSIONS.md)
   içindeki hedeflere kurun; iTerm2 veya Ghostty/CMUX dikte tuşunu aynı belgedeki adımlarla
   eşleyin.
5. [MCP.md](MCP.md) içindeki `mcp.json` dosyasını kurup Stripe OAuth
   yetkilendirmesini tamamlayın.
6. Pi'yi yeniden yükleyip kurulum kontrolünü çalıştırın.

`pi-fff` kullanılırken home dizininin tamamının indekslenmesini önlemek için
`~/.zshrc` içine şu kalıcı varsayılanı ekleyin:

```bash
export FFF_ENABLE_HOME_SCAN=0
```

Ardından yeni bir terminal açın veya `source ~/.zshrc` çalıştırın. Bu ayar
proje dizinlerinin indekslenmesini engellemez; yalnız Pi doğrudan `$HOME`
içinden başlatıldığında home taramasını kapatır.

## Kanonik varsayılanlar

| Ayar | Değer |
|---|---|
| Sağlayıcı | `opencode-go` |
| Model | `minimax-m3` |
| Thinking | `high` |
| Tema | `dark` |

Kanonik güvenli Pi ayarları [`config/settings.json`](config/settings.json)
içinde bulunur. Dosya paketlerin exact sürümlerini, varsayılan modeli ve model
seçicide görünmesi istenen kısa listeyi birlikte taşır.

`~/.pi/agent/settings.json` içinde temel tercihlerin karşılığı:

```json
{
  "theme": "dark",
  "defaultProvider": "opencode-go",
  "defaultModel": "minimax-m3",
  "defaultThinkingLevel": "high"
}
```

Repo dosyasını mevcut `settings.json` içine birleştirin; `lastChangelogVersion`
gibi Pi'nin yönettiği alanları veya makineye özel başka ayarları yanlışlıkla
silmemek için bütün dosyanın üstüne körlemesine kopyalamayın. Günlük görev için
Pi içinde Ctrl+P ile model değiştirmek `defaultModel` ve `defaultProvider`
alanlarını canlı ayarlarda güncelleyebilir; bu dosya bu bilgisayardaki son
kanonik başlangıç değerlerini taşır.

## Kurulum kontrolü

```bash
pi --version
pi list
pi auth check --provider openai-codex
pi auth check --provider opencode-go
```

Pi içinde ayrıca:

```text
/reload
/mcp
```

Beklenen sonuç:

- Pi `0.84.2` çalışır.
- [EXTENSIONS.md](EXTENSIONS.md) içindeki on npm paketi yüklüdür.
- Varsayılan oturum `opencode-go/minimax-m3`, `high` ile açılır.
- `stripe` ve `context7` MCP sunucuları görünür.
- `~/.pi/agent/extensions/` altında özel `.ts` extension yoktur.
- `~/.pi/agent/agents/` altında özel workflow agent'ı yoktur.

Kurulu olmayan adaylar ve kalibrasyon notları [EXTENSIONS.md](EXTENSIONS.md)
içinde ayrı tutulur. Codex aboneliğiyle dikte ile iTerm2 veya Ghostty/CMUX
tırnak-tuşu toggle eşlemesi de aynı dosyada yeniden kurulum adımlarıyla
belgelenmiştir.

## Default kurulumun dışında kalanlar

`pi-workflow/` içindeki Hospital sistemi repoda kaynak ve geliştirme geçmişi
olarak tutulur; **default Pi kurulumunun parçası değildir ve
`./pi-workflow/install.sh` çalıştırılmamalıdır**.

Default kurulumda şunlar yoktur:

- `hospital-spec.ts`
- Hospital'ın `workflow-*.md` özel agent'ları
- Hospital runtime state'i
- `web-search.ts`

Web erişimi ayrı bir yerel `web-search.ts` dosyasıyla değil,
`pi-web-access` npm paketiyle sağlanır.

## Başka bilgisayara taşınmayan veriler

Şunları cihazlar arasında kopyalamayın:

- `auth.json` ve OAuth token'ları
- API anahtarları
- `sessions/`, `missions/` ve `run-history.jsonl`
- MCP cache ve runtime state
- makineye özgü binary veya geçici dosyalar

Her bilgisayarda hesap girişlerini ve Stripe OAuth yetkilendirmesini yeniden
yapın.

## Dizinler

```text
pi-agent/
├── README.md       # kanonik kurulum sırası ve doğrulama
├── EXTENSIONS.md   # default npm paketleri ve hariç tutulan yerel eklentiler
├── MCP.md          # Stripe ve Context7 yapılandırması
└── config/         # secretsiz, taşınabilir Pi/extension yapılandırmaları
```
