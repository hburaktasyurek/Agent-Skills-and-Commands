# Pi Agent

Bu klasör, Pi Agent kurulumunun taşınabilir envanteri ve yeni bilgisayar
kurulum rehberidir. Amaç, bu repoyu açan kişinin hangi Pi sürümünü,
extension'ları, özel agent'ları ve MCP'leri kuracağını tek yerden görmesidir.

Bu doküman 15 Ağustos 2026'da bu Mac'teki kurulumdan çıkarılmıştır. Parola,
API anahtarı, OAuth oturumu, geçmiş ve çalışma durumu burada tutulmaz.

## Hızlı kurulum

Önkoşullar: Node.js/npm, Git ve bu reponun yerel klonu.

```bash
npm install --global @earendil-works/pi-coding-agent@0.84.2
pi --version
```

Beklenen sürüm: `0.84.2`.

Ardından [EXTENSIONS.md](EXTENSIONS.md) içindeki beş npm extension komutunu
çalıştırın. Repo tarafından yönetilen Hospital workflow ve on iki özel agent
gerekliyse, repo kökünden şunu çalıştırın:

```bash
./pi-workflow/install.sh
```

Son olarak [MCP.md](MCP.md) içindeki `~/.pi/agent/mcp.json` yapılandırmasını
oluşturun; Stripe için kendi hesabınızla OAuth yetkilendirmesini tamamlayın.

## Kurulum kontrolü

```bash
pi --version
pi list
pi auth check --provider openai-codex
pi auth check --provider opencode-go
./pi-workflow/install.sh --check
```

İlk iki `auth check` yalnızca sağlayıcı erişimini kontrol eder; hiçbir
kimlik bilgisini bu repoya kopyalamayın. `pi-workflow` kullanılmıyorsa son
kontrol gerekli değildir.

## Bu Mac'teki varsayılanlar

| Ayar | Değer |
|---|---|
| Sağlayıcı | `openai-codex` |
| Model | `gpt-5.6-luna` |
| Thinking | `high` |
| Proje güveni | `ask` |
| Etkin modeller | `openai-codex/gpt-5.6-sol`, `openai-codex/gpt-5.6-luna`, `opencode-go/deepseek-v4-pro`, `opencode-go/deepseek-v4-flash`, `opencode-go/qwen3.8-max` |

Bu ayarlar tercih envanteridir; yeni bilgisayarda ilgili sağlayıcı erişimi
olmadan model seçimi çalışmaz.

## Taşınabilirlik durumu

`pi-workflow/` repo tarafından sürümlenen Hospital workflow kaynağıdır.
Ancak bu Mac'teki yüklü `~/.pi/agent/extensions/hospital-spec.ts`, mevcut
repo kopyasıyla aynı değildir. Ayrıca `web-search.ts` yalnızca bu Mac'in
`~/.pi/agent/extensions/` dizinindedir ve bu repoda kaynak kopyası yoktur.

Bu nedenle bu rehber npm extension'ları, MCP'leri ve repo-yönetimli workflow'u
yeniden kurar; **mevcut Mac ile byte-byte aynı yerel extension durumunu henüz
yeniden kurmaz**. Bu iki yerel dosya gözden geçirilip repoya açıkça kaynak
olarak eklenmeden "aynı sistem" iddiası yapılmamalıdır.

## Dizinler

```text
pi-agent/
├── README.md       # kurulum sırası, kontrol ve sınırlar
├── EXTENSIONS.md   # npm, yerel extension ve özel agent envanteri
└── MCP.md          # MCP sunucuları ve güvenli yapılandırma
```
