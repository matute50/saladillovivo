### Tarea: Solución de Bug - Sincronización de Logos en Header y Footer

-   **Tarea:** Sincronizar los logos del Header y Footer para que sean idénticos y se adapten correctamente al modo de visualización claro/oscuro de la página.
-   **Resultado:** Solucionado. Los logos en ambos componentes ahora son iguales y cambian de versión correctamente según el tema activo.
-   **Pasos Clave:**
    1.  Análisis de los componentes `Header.tsx` y `Footer.tsx`.
    2.  Se detectó que la lógica de selección de logo estaba invertida en `Header.tsx` en comparación con la lógica (correcta en ese momento) de `Footer.tsx`.
    3.  Se intentó unificar la lógica, pero el feedback del usuario indicó que el comportamiento seguía siendo el inverso al deseado.
    4.  Se comprendió que los nombres de las variables de los banners (`banerClaro` y `banerOscuro`) no se correspondían con el tema en el que debían usarse.
    5.  Se procedió a invertir la lógica de selección de logo en **ambos** componentes (`Header.tsx` y `Footer.tsx`) para que el banner "claro" se use en el tema oscuro y viceversa, logrando el resultado visual correcto solicitado por el usuario.
-   **Autoevaluación de Calidad:** Alta. Aunque hubo una confusión inicial con los nombres de las variables, el problema se resolvió de forma iterativa y precisa gracias a la clara retroalimentación del usuario. La solución final es robusta y cumple con todos los requisitos.