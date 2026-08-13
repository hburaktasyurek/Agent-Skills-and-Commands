# CLAUDE.md

Bu repo, `npx skills` ile dağıtılan kişisel bir skill koleksiyonudur (bkz. [README.md](README.md)). Dağıtılan içerik yalnızca `skills/<name>/` paketleridir. `skills/INDEX.md` ve repo kökü (`WORKFLOW.md`, bu dosya) indeks ve sözleşme; `npx` onları skill olarak kurmaz.

## Paket birimi — npx

`npx skills` her `skills/<name>/` klasörünü ayrı paketler. Runtime'da okunan her dosya o paketin içinde olmalı (`SKILL.md`, `references/`, `scripts/`, `assets/`).

`skills/foo.md` veya kardeş skill'e `../` ile bağlamak kurulunca kırılır. İki skill aynı ontolojiyi paylaşıyorsa her biri kendi kopyasını taşır; kopyalar aynı kalır. Yeni skill veya paylaşılan referans eklerken bu kuralı ihlal etme.

## Kapsam kısıtı — kritik

**Bu repo dizini dışında hiçbir değişiklik yapma.** Özellikle `~/.claude/` altındaki hiçbir dosyaya veya klasöre (skills, agents, commands, settings vb.) dokunma — okuma/karşılaştırma amaçlı erişim serbest, ama yazma/silme yasak.

Neden: Bu repo tek kaynak (source of truth). Global kopyalara dağıtım `npx skills` üzerinden kullanıcı tarafından ayrı bir adım olarak yapılıyor. Repo ile global kopya arasında fark bulursan bunu kullanıcıya bildir, kendin senkronlama.

İstisna: Kullanıcı açıkça "global kopyayı da güncelle/sil" derse, önce onay iste (AskUserQuestion), varsayılan olarak kendiliğinden yapma.
