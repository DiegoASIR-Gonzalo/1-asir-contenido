#Escribir un programa que introduzca en una lista lista de números enteros
#(Hay que introducir 5 números) e indique si se encuentran ordenados
#de menor a mayor o no.
listanumeros=[]
for i in range(0, 5):
    numero=int(input("Introduce un número: "))
    listanumeros.append(numero)

for i in range(4):
    if listanumeros[i] > listanumeros[i+1]:
        ordenada=True
    else:
        ordenada=False
        
if ordenada == False:
    print(f"La lista esta de menor a mayor")
elif ordenada == True:
    print(f"La lista no esta de menor a mayor")