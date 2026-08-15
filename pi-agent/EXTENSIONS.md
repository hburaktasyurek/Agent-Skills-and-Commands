# Pi Agent extensions

Bu envanter, 15 Ağustos 2026'da `~/.pi/agent/settings.json` ve yerel
extension dizininden çıkarılmıştır.

## npm extension'ları

Yeni bilgisayarda aşağıdaki komutları tek tek çalıştırın. Sürümler, bu
Mac'teki çözümlenmiş sürümlere sabitlenmiştir.

```bash
pi install npm:pi-subagents@0.49.0
pi install npm:@juicesharp/rpiv-ask-user-question@2.5.1
pi install npm:@hk_net/pi-thinking-command@0.1.7
pi install npm:pi-web-access@0.22.0
pi install npm:pi-mcp-adapter@2.25.0
```

| Paket | Kullanım alanı |
|---|---|
| `pi-subagents` | Alt agent çalıştırma ve yönetimi |
| `@juicesharp/rpiv-ask-user-question` | Kullanıcıya yapılandırılmış soru sorma |
| `@hk_net/pi-thinking-command` | Thinking düzeyini komutla değiştirme |
| `pi-web-access` | Web erişim araçları |
| `pi-mcp-adapter` | MCP araçlarını Pi araçlarına bağlama |

Kurulumdan sonra `pi list` ile paketlerin ayarlara eklendiğini doğrulayın.

## Dosya tabanlı extension'lar

| Dosya | Durum | Not |
|---|---|---|
| `hospital-spec.ts` | Repo tarafından yönetiliyor, fakat bu Mac'te kurulu kopya farklı | Kaynak: `pi-workflow/extensions/hospital-spec.ts`; `./pi-workflow/install.sh` bunu ve bağımlı kontrol çekirdeğini kurar. |
| `web-search.ts` | Yalnızca bu Mac'te yerel | `~/.pi/agent/extensions/web-search.ts`; repo içinde sürümlenmiş kaynak henüz yok. |

Yerel extension kaynakları, Pi'nin `~/.pi/agent/extensions/` dizininden
yüklenir. Oturum, state veya `auth.json` dosyalarını başka bilgisayara
kopyalamayın.

## Özel workflow agent'ları

Bu Mac'te aşağıdaki 12 agent yüklüdür. Sürümlenen kaynakları
`pi-workflow/agents/` altında bulunur ve `./pi-workflow/install.sh` ile
kurulur.

```text
workflow-groundwork
workflow-evidence
workflow-to-spec
workflow-commit
workflow-adversarial-spec
workflow-spec-readiness
workflow-consult
workflow-implement
workflow-implementation-review
workflow-diff-review
workflow-pr
workflow-pr-review
```

Bu workflow, `openai-codex` ve `opencode-go` sağlayıcılarındaki sabit model
adlarına dayanır. Sağlayıcı erişimi doğrulanmadan çalıştırılmamalıdır.
