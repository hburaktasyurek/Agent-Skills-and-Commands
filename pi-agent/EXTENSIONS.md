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
```

| Paket | Kullanım alanı |
|---|---|
| `pi-subagents` | Alt agent çalıştırma ve yönetimi |
| `@juicesharp/rpiv-ask-user-question` | Kullanıcıya yapılandırılmış soru sorma |
| `@hk_net/pi-thinking-command` | Thinking düzeyini komutla değiştirme |
| `pi-web-access` | Web erişim araçları |
| `pi-mcp-adapter` | MCP sunucularını Pi araçlarına bağlama |

Kurulumdan sonra `pi list` ile bu beş paketi ve sürümlerini doğrulayın.

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
