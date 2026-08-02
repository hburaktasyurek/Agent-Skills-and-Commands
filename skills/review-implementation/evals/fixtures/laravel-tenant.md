# Frozen review fixture: Laravel tenant order view

## Named specification: `specs/order-view.md`

Authenticated tenant members may view an order only when the order belongs to
their current tenant and `OrderPolicy::view` permits access. A cross-tenant
identifier must return 404. The endpoint returns order id and status.

## Repository evidence

`composer.json` requires `laravel/framework`. `app/Models/Order.php` has a
`tenant_id` column but no global scope. `app/Policies/OrderPolicy.php` compares
the user's tenant and role. `ARCHITECTURE.md` says tenant-owned queries must be
scoped explicitly and policies must be enforced by controllers.

## Implementation basis: `app/Http/Controllers/OrderController.php`

```php
public function show(int $id): JsonResponse
{
    $order = Order::query()->findOrFail($id);

    return response()->json([
        'id' => $order->id,
        'status' => $order->status,
    ]);
}
```

The route uses only `auth` middleware. The controller does not call
`authorize`, and no route-level `can` middleware is present.

## Tests

The feature test covers an allowed same-tenant member. No cross-tenant or
policy-denied case is present. This change contains no payment or migration.
