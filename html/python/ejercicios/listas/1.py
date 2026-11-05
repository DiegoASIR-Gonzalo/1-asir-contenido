#Escriba un programa que permita crear una lista de palabras
#(se pedirán palabras hasta que se meta un espacio) y que, a continuación,
#pida dos palabras y sustituya la primera por la segunda en la lista.
lista=[]
palabra=input("Introduce una palabra (poner un espacio significa terminar el programa):")

while palabra != ' ':
    lista.append(palabra)
    palabra=input("Introduce una palabra (poner un espacio significa terminar el programa):")

palabra1=input("Introduce la palabra a sustituir: ")
palabra2=input("Introduce la nueva palabra: ")

for i in range(len(lista)):
    if palabra1 == lista[i]:
        lista[i]=palabra2