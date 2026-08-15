# Pi Agent

Bu klasör, kişisel Pi Agent kurulumunun **kanonik/default** envanteridir.
Yeni bir bilgisayarda Pi kurulurken bu bilgisayardaki düzeni yeniden üretmek
için kullanılır.

Referans durum 15 Ağustos 2026'da bu Mac'ten alınmıştır. Parolalar, API
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

1. [EXTENSIONS.md](EXTENSIONS.md) içindeki beş npm paketini kurun.
2. Pi'de `openai-codex` ve `opencode-go` hesaplarına giriş yapın.
3. Varsayılan sağlayıcı/model ayarlarını aşağıdaki tabloya göre ayarlayın.
4. [MCP.md](MCP.md) içindeki `mcp.json` dosyasını kurup Stripe OAuth
   yetkilendirmesini tamamlayın.
5. Pi'yi yeniden yükleyip kurulum kontrolünü çalıştırın.

## Kanonik varsayılanlar

| Ayar | Değer |
|---|---|
| Sağlayıcı | `opencode-go` |
| Model | `deepseek-v4-pro` |
| Thinking | `high` |
| Tema | `dark` |

`~/.pi/agent/settings.json` içinde bu tercihlerin karşılığı:

```json
{
  "theme": "dark",
  "defaultProvider": "opencode-go",
  "defaultModel": "deepseek-v4-pro",
  "defaultThinkingLevel": "high"
}
```

Bu parçayı mevcut `settings.json` içine birleştirin; paket listesini veya
makineye özel başka ayarları yanlışlıkla silmeyin.

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
- [EXTENSIONS.md](EXTENSIONS.md) içindeki beş npm paketi yüklüdür.
- Varsayılan oturum `opencode-go/deepseek-v4-pro`, `high` ile açılır.
- `stripe` ve `context7` MCP sunucuları görünür.
- `~/.pi/agent/extensions/` altında özel `.ts` extension yoktur.
- `~/.pi/agent/agents/` altında özel workflow agent'ı yoktur.

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
└── MCP.md          # Stripe ve Context7 yapılandırması
```
