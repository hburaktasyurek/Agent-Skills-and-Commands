# CLAUDE.md

Bu repo, `npx skills` ile dağıtılan kişisel bir Claude Code skill/agent kitidir (bkz. [README.md](README.md)). İçeriği: `skills/`, `agents/`, `commands/`, `standards/`, `scripts/`.

## Kapsam kısıtı — kritik

**Bu repo dizini dışında hiçbir değişiklik yapma.** Özellikle `~/.claude/` altındaki hiçbir dosyaya veya klasöre (skills, agents, commands, settings vb.) dokunma — okuma/karşılaştırma amaçlı erişim serbest, ama yazma/silme yasak.

Neden: Bu repo tek kaynak (source of truth). Global `~/.claude` kopyasına dağıtım `npx skills` üzerinden kullanıcı tarafından ayrı bir adım olarak yapılıyor. Repo ile global kopya arasında fark bulursan bunu kullanıcıya bildir, kendin senkronlama.

İstisna: Kullanıcı açıkça "global kopyayı da güncelle/sil" derse, önce onay iste (AskUserQuestion), varsayılan olarak kendiliğinden yapma.
