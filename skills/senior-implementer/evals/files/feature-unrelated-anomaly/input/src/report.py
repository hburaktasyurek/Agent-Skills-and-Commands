def build_active_report(rows):
    return [{"id": row["id"], "name": row["name"]} for row in rows]
