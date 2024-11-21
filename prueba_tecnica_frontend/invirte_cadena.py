texto = input("Ingresa tu texto aquí: ")
print(texto)
texto_final = texto
parentesis = True

while (parentesis):
    suma = 0
    abre = 0
    cierra = 0
    texto_inverso = ''

    for i in range(len(texto_final)):
        if(texto_final[i] == "("):
            abre = i
            suma += 1

    for k in range(len(texto_final)):
        if(texto_final[len(texto_final) - 1 - k] == ")" and len(texto_final) - 1 - k > abre):
            cierra = len(texto_final) - 1 - k
    
    for j in range(abre + 1, cierra):
        texto_inverso = texto_final[j] + texto_inverso  
    
    texto_final = texto_final[0:abre] + texto_inverso + texto_final[cierra+1:len(texto)+1]
    
    print(texto_final)
    if (suma == 1):
        parentesis = False