# Configurar la base de datos de CALISTHENICS PRO

1. Crea un proyecto en https://supabase.com/ (elige una contraseña fuerte para la base de datos y guárdala en un lugar seguro).
2. En el proyecto, abre SQL Editor, crea una consulta nueva, pega el contenido de `supabase/schema.sql` y pulsa Run.
3. En Project Settings > API, copia Project URL y la clave pública (publishable key o anon key).
4. En la raíz del proyecto crea un archivo `.env` usando `.env.example` como guía y coloca esos dos valores.
5. Nunca uses la clave `service_role` en la aplicación ni la compartas en el chat.
6. Después de configurar las variables, reinicia Expo para que las lea.

El esquema crea perfiles y una fila privada de datos por usuario. Las políticas RLS impiden que una cuenta lea o modifique los datos de otra.

La conexión y las funciones de lectura/escritura están preparadas en `lib/supabase.ts`. La pantalla de registro/inicio de sesión y la sincronización automática se conectarán en los siguientes cambios, después de configurar el proyecto Supabase.
