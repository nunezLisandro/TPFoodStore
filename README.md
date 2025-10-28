# Backend (Food Store) - Skeleton

Este backend es un ejemplo mínimo con Spring Boot + H2 que expone endpoints de autenticación:

Endpoints
- POST /api/auth/register  -> { name, email, password }
- POST /api/auth/login     -> { email, password }

Datos de prueba
- Admin suggestion: después de registrar, podés actualizar rol en la BD a 'admin'.

Correr localmente
1. Tener Java 17+ y Maven instalados.
2. Desde la carpeta `backend/` ejecutar:

```bash
mvn spring-boot:run
```

3. El servidor correrá en http://localhost:8080
4. H2 Console: http://localhost:8080/h2-console (jdbc:h2:./data/foodstore, user=sa)

Notas
- Las contraseñas se guardan con BCrypt (no es JWT).
- Para pruebas rápidas, registrá un usuario y luego manualmente cambiale el rol a 'admin' en la BD si querés probar la parte admin.
