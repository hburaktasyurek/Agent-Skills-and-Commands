# Pi Agent MCP

Default Pi kurulumunda iki uzak MCP sunucusu tanımlıdır. Yapılandırma dosyası
`~/.pi/agent/mcp.json` yolundadır ve `pi-mcp-adapter` tarafından okunur.

## Tanımlı sunucular

| Ad | Uç nokta | Yetkilendirme |
|---|---|---|
| `stripe` | `https://mcp.stripe.com` | OAuth |
| `context7` | `https://mcp.context7.com/mcp` | Bu dosyada ek kimlik bilgisi yok |

Yeni bilgisayarda `~/.pi/agent/mcp.json` dosyasına aşağıdaki yapılandırmayı
yazın:

```json
{
  "mcpServers": {
    "stripe": {
      "url": "https://mcp.stripe.com",
      "auth": "oauth"
    },
    "context7": {
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

## Güvenlik ve kontrol

- `auth.json`, OAuth token'ları, API anahtarları, `mcp-cache.json`, oturumlar
  ve runtime state kişiseldir; bu repoya eklenmez ve başka cihaza kopyalanmaz.
- Stripe OAuth yetkilendirmesini yeni bilgisayarda, doğru Stripe hesabıyla
  yeniden tamamlayın.
- Pi açıldıktan sonra `/reload`, ardından `/mcp` çalıştırın.
- Stripe girişini `/mcp-auth stripe` ile tamamlayın.
- MCP araçlarının listelendiğini ve yalnızca beklenen hesap/veri alanına
  eriştiğini kontrol edin.
- Uzak MCP uç noktaları erişim ve araç kapsamını zamanla değiştirebilir;
  kullanmadan önce Pi'nin güncel bağlantı/yetkilendirme ekranında doğrulayın.
