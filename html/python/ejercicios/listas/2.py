#Escriba un programa que permita crear dos listas de palabras
#(se pedirá cuantas palabras se van a introducir en cada lista)  y que,
#a continuación, elimine de la primera lista los nombres de la segunda lista.
lista1=[]
lista2=[]

cantidad_lista1=int(input("Introduce la cantidad de palabras que vayas a introducir en la primera lista: "))
cantidad_lista2=int(input("Introduce la cantidad de palabras que vayas a introducir en la segunda lista: "))

for i in range(cantidad_lista1):
    palabra=input("Introduce una palabra (º1 Lista): ")
    lista1.append(palabra)
for i in range(cantidad_lista2):
    palabra=input("Introduce una palabra (º2 Lista): ")
    lista2.append(palabra)

for i in lista2:
    while i in lista1:
        lista1.remove(i)

print(lista1, lista2)