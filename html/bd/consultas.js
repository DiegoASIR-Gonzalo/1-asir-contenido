/* ==========================================================
   consultas.js
   Aquí se añaden, modifican o borran las consultas de la pila.
   Cada objeto es un disco. El orden del array es el orden de
   arriba a abajo en la columna y en el índice lateral.

   Campos:
     titulo       -> nombre que se ve en el disco y en el índice
     categoria    -> etiqueta corta (SELECT, JOIN, UPDATE...)
     descripcion  -> una frase explicando qué hace la consulta
     sql          -> el código (usa comillas invertidas ` ` para
                     poder escribir varias líneas)

   Para añadir una nueva, copia un bloque { ... }, pégalo al final
   y cambia sus valores. No hace falta tocar el HTML.
   Las tablas son de ejemplo: alumnos, profesores, cursos, matriculas.
   ========================================================== */

const ACADEMIA = [
  {
    titulo: "Ejercicio 1",
    categoria: "SELECT",
    descripcion: "Obtener el nombre de los cursos de más de 300 horas y que admiten a más de 100 alumnos.",
    sql: `SELECT nombreCurso, numhoras, maxAlumnos 
FROM cursos 
WHERE numhoras > 300 AND maxAlumnos > 100;`
  },
  {
    titulo: "Ejercicio 2",
    categoria: "ORDER BY",
    descripcion: "Obtener el nombre, código, fecha de inicio, fecha final y horas de todos los cursos que se imparten en la academia, ordenados alfabéticamente por nombre.",
    sql: `SELECT nombreCurso, codigoCurso, fechaIni, fechaFin, numhoras 
FROM cursos 
ORDER BY nombreCurso ASC;`
  },
  {
    titulo: "Ejercicio 3",
    categoria: "MONTH",
    descripcion: "Mostrar toda la información de los cursos que comienzan en el mes de Mayo, incluyendo Nombre, Código, DNI del profesor, número máximo de alumnos, fecha de inicio, fecha final y número de horas.",
    sql: `SELECT cursos.*, profesores.dni 
FROM cursos, profesores 
WHERE MONTH(cursos.fechaIni) = 5 AND cursos.profesor = profesores.dni;`
  },
  {
    titulo: "Ejercicio 4",
    categoria: "IN",
    descripcion: "Mostrar el nombre de la oposición y la categoría de las oposiciones de categoría A, B o C.",
    sql: `SELECT nombre, categoria 
FROM oposiciones 
WHERE categoria IN (“A”, “B”, “C”);`
  },
  {
    titulo: "Ejercicio 6",
    categoria: "JOIN",
    descripcion: "Obtener un listado con el nombre completo de los alumnos con matricula oficial, el nombre del curso en el que están matriculados y la fecha de inscripción a dicho curso.",
    sql: `SELECT DISTINCT alumnos.nombre, alumnos.apellido1, alumnos.apellido2, cursos.nombreCurso, matriculas.inscripcion, matriculas.tipo 
FROM alumnos, cursos, matriculas 
WHERE alumnos.dni = matriculas.dniAlumno 
AND cursos.codigoCurso = matriculas.codCurso 
AND matriculas.tipo = "oficial";`
  },
  {
    titulo: "Ejercicio 7",
    categoria: "RELACION",
    descripcion: "Relación de los cursos que sirven para preparar la oposición llamada 'Maestros de Primaria' junto con el nombre del profesor que lo imparte.",
    sql: `SELECT DISTINCT cursos.nombreCurso, oposiciones.nombre "Oposiciones Nombre", profesores.nombre "Profesores Nombre" 
FROM cursos, oposiciones, profesores, curso_oposicion 
WHERE oposiciones.nombre = "Maestros de Primaria" 
AND cursos.codigoCurso = curso_oposicion.codCurso 
AND oposiciones.codigo = curso_oposicion.codOposicion 
AND cursos.profesor = profesores.dni;`
  },
  {
    titulo: "Ejercicio 8",
    categoria: "WHERE | JOIN",
    descripcion: "Listado de las oposiciones a las que se puede acceder, recibiendo los cursos que imparte el profesor 'Manuel López García'.",
    sql: `SELECT nombre 
FROM opocisiones 
WHERE codigo IN 
(SELECT codOpocision 
    FROM curso_opocision 
    WHERE codCurso = 
    (SELECT codCurso 
        FROM cursos 
        WHERE profesor = 
        (SELECT dni 
            FROM profesores 
            WHERE nombre=”Manuel” 
            AND apellido1 = "López" 
            AND apellido2 = "García")));`
  },
  {
    titulo: "Ejercicio 10",
    categoria: "HAVING",
    descripcion: "Titulo y precio de los manuales recomendados para el curso 'Función Pública'.",
    sql: `SELECT titulo, precio 
FROM manuales 
WHERE referencia IN 
(SELECT curso _manual.referencia 
    FROM curso_manual 
    WHERE codCurso IN 
    (SELECT cursos.codigoCurso 
        FROM cursos
        WHERE nombreCurso = ‘Función Pública’));`
  },
  {
    titulo: "Ejericio 11",
    categoria: "SUBCONSULTA",
    descripcion: "Obtener un listado con los alumnos más jóvenes que 'Luisa Sánchez Donoso'.",
    sql: `SELECT * 
FROM alumnos 
WHERE fechaNac > 
(SELECT fechaNac 
    FROM alumnos 
    WHERE nombre = "Luisa" 
    AND apellido1 = "Sánchez" 
    AND apellido2 = "Donoso");`
  },
  {
    titulo: "Ejercicio 12",
    categoria: "GROUP BY",
    descripcion: "Obtener el nombre de los cursos en los que hay más alumnos matriculados que en el curso más numeroso del profesor 'Manuel López García'.",
    sql: `SELECT nombreCurso 
FROM cursos 
WHERE (SELECT COUNT(*) 
    FROM matriculas 
    WHERE codCurso = cursos.codigoCurso) > 
ALL (SELECT COUNT(*) 
    FROM cursos 
    JOIN profesores ON dni = cursos.profesor 
    JOIN matriculas ON codCurso = cursos.codigoCurso 
    WHERE profesores.nombre = 'Manuel' 
    AND apellido1 = 'Lopez' 
    AND apellido2 = 'Garcia' 
    GROUP BY cursos.codigoCurso);`
  },
  {
    titulo: "Ejercicio 13",
    categoria: "JOIN",
    descripcion: "Obtener los nombres de los cursos impartidos por el profesor 'Luis Pérez Sánchez' que sirvan para la oposición 'Funcionario de Prisiones'.",
    sql: `SELECT nombreCurso, profesores.nombre, profesores.apellido1, profesores.apellido2 
FROM cursos, profesores, oposiciones, curso_oposicion curso_opo 
WHERE cursos.profesor = profesores.dni 
AND oposiciones.codigo = curso_opo.codOposicion 
AND cursos.codigoCurso = curso_opo.codCurso 
AND oposiciones.nombre = 'Funcionario de Prisiones' 
AND cursos.profesor = '222';`
  },
  {
    titulo: "Crear la tabla cursos",
    categoria: "DDL",
    descripcion: "Define una tabla con clave primaria y clave foránea.",
    sql: `CREATE TABLE cursos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(80) NOT NULL,
  horas       INT DEFAULT 0,
  id_profesor INT,
  FOREIGN KEY (id_profesor) REFERENCES profesores(id)
);`
  }
];

const TIENDA = [
  {
    titulo: "Productos con poco stock",
    categoria: "WHERE",
    descripcion: "Detecta los productos que conviene reponer.",
    sql: `SELECT nombre, stock
FROM productos
WHERE stock < 10
ORDER BY stock ASC;`
  },
  {
    titulo: "Clientes de Sevilla",
    categoria: "WHERE",
    descripcion: "Filtra clientes por ciudad.",
    sql: `SELECT nombre, email
FROM clientes
WHERE ciudad = 'Sevilla';`
  },
  {
    titulo: "Pedidos con su cliente",
    categoria: "JOIN",
    descripcion: "Muestra cada pedido junto al nombre de quien lo hizo.",
    sql: `SELECT p.id, c.nombre, p.fecha, p.estado
FROM pedidos p
INNER JOIN clientes c ON c.id = p.id_cliente
ORDER BY p.fecha DESC;`
  },
  {
    titulo: "Total gastado por cliente",
    categoria: "SUM",
    descripcion: "Suma el importe de todas las líneas de pedido de cada cliente.",
    sql: `SELECT c.nombre, SUM(l.cantidad * l.precio) AS total
FROM clientes c
JOIN pedidos p ON p.id_cliente = c.id
JOIN lineas_pedido l ON l.id_pedido = p.id
GROUP BY c.id, c.nombre
ORDER BY total DESC;`
  },
  {
    titulo: "Los 5 productos más vendidos",
    categoria: "LIMIT",
    descripcion: "Agrupa por producto y se queda con los cinco primeros.",
    sql: `SELECT pr.nombre, SUM(l.cantidad) AS unidades
FROM lineas_pedido l
JOIN productos pr ON pr.id = l.id_producto
GROUP BY pr.id, pr.nombre
ORDER BY unidades DESC
LIMIT 5;`
  },
  {
    titulo: "Clientes que nunca han comprado",
    categoria: "LEFT JOIN",
    descripcion: "Un LEFT JOIN con IS NULL localiza lo que no tiene pareja.",
    sql: `SELECT c.nombre
FROM clientes c
LEFT JOIN pedidos p ON p.id_cliente = c.id
WHERE p.id IS NULL;`
  },
  {
    titulo: "Aplicar un 10% de descuento",
    categoria: "UPDATE",
    descripcion: "Rebaja el precio de una categoría entera.",
    sql: `UPDATE productos
SET precio = ROUND(precio * 0.90, 2)
WHERE categoria = 'Ofertas';`
  },
  {
    titulo: "Borrar pedidos cancelados",
    categoria: "DELETE",
    descripcion: "Elimina registros concretos. Prueba antes con un SELECT.",
    sql: `DELETE FROM pedidos
WHERE estado = 'cancelado'
  AND fecha < '2025-01-01';`
  }
];

const BIBLIOTECA = [
  {
    titulo: "Libros posteriores a 2010",
    categoria: "WHERE",
    descripcion: "Filtra por año de publicación.",
    sql: `SELECT titulo, anio
FROM libros
WHERE anio > 2010
ORDER BY anio DESC;`
  },
  {
    titulo: "Libros y su autor",
    categoria: "JOIN",
    descripcion: "Une libros con autores.",
    sql: `SELECT l.titulo, a.nombre AS autor
FROM libros l
JOIN autores a ON a.id = l.id_autor;`
  },
  {
    titulo: "Préstamos sin devolver",
    categoria: "IS NULL",
    descripcion: "Los préstamos cuya fecha de devolución sigue vacía.",
    sql: `SELECT s.nombre, l.titulo, p.fecha_prestamo
FROM prestamos p
JOIN socios s ON s.id = p.id_socio
JOIN libros l ON l.id = p.id_libro
WHERE p.fecha_devolucion IS NULL;`
  },
  {
    titulo: "Préstamos por socio",
    categoria: "COUNT",
    descripcion: "Cuenta cuántos libros ha pedido cada socio.",
    sql: `SELECT s.nombre, COUNT(*) AS prestamos
FROM socios s
JOIN prestamos p ON p.id_socio = s.id
GROUP BY s.id, s.nombre;`
  },
  {
    titulo: "Socios con más de 3 préstamos",
    categoria: "HAVING",
    descripcion: "Filtra los grupos ya contados.",
    sql: `SELECT id_socio, COUNT(*) AS total
FROM prestamos
GROUP BY id_socio
HAVING COUNT(*) > 3;`
  },
  {
    titulo: "Registrar un libro nuevo",
    categoria: "INSERT",
    descripcion: "Inserta una fila indicando las columnas.",
    sql: `INSERT INTO libros (titulo, anio, id_autor)
VALUES ('Fundación', 1951, 4);`
  }
];

/* ----------------------------------------------------------
   BASES: cada elemento es una base de datos del selector.
     nombre      -> texto del botón y de la tapa de la columna
     descripcion -> aparece al dejar el cursor sobre el botón
     matiz       -> color del LED (0-360: 135 verde, 28 naranja,
                    210 azul, 330 rosa...)
     consultas   -> el array de discos de esa base
   Para añadir otra base: crea un array como los de arriba y
   añade aquí un bloque nuevo.
   ---------------------------------------------------------- */
window.BASES = [
  { nombre: "Practica Light",   descripcion: "alumnos, profesores, cursos y matrículas", matiz: 135, consultas: ACADEMIA },
  { nombre: "Practica Final",     descripcion: "streaming y mensajería",            matiz: 28,  consultas: TIENDA },
  { nombre: "Biblioteca", descripcion: "libros, autores, socios y préstamos",      matiz: 210, consultas: BIBLIOTECA }
];
