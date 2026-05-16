package ExamenPrimerParcial;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Scanner;

public class ExamenPrimerParcial {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int opcion;

        do {
            ArrayList<Integer> numeros = new ArrayList<>();
            int num;

            double media = 0;
            double mediana = 0;
            int moda = 0;
            int edad;

            System.out.println("Ingresa los números que desees enlistar");
            System.out.println("Coloca un (0) al terminar de ingreaar los datos");

            do {
        if (sc.hasNextInt()) {
            num = sc.nextInt();

        if (num != 0) {
            numeros.add(num);
        }

        } else {
            System.out.println("Inválido. Solo números enteros (ej: -1, 10, ...)");
                sc.next();
                num = -999;
            }

            } while (num != 0);


            if (numeros.size() == 0) {
                System.out.println("No hay datos.");
            } else {

                double suma = 0;
                for (int n : numeros) {
                    suma += n;
                }
                media = suma / numeros.size();

                Collections.sort(numeros);
                int n = numeros.size();
                if (n % 2 == 0) {
                    mediana = (numeros.get(n/2 - 1) + numeros.get(n/2)) / 2.0;
                } else {
                    mediana = numeros.get(n/2);
                }

                HashMap<Integer, Integer> frecuencia = new HashMap<>();
                for (int numero : numeros) {
                    frecuencia.put(numero, frecuencia.getOrDefault(numero, 0) + 1);
                }

                int maxFrecuencia = 0;
                for (int key : frecuencia.keySet()) {
                    if (frecuencia.get(key) > maxFrecuencia) {
                        maxFrecuencia = frecuencia.get(key);
                        moda = key;
                    }
                }
            }

            sc.nextLine();

            System.out.println("\nIngresa tu nombre completo: ");
            String nombre = sc.nextLine();

            System.out.println("Ingresa tu fecha de nacimiento: (De la manera en la que se te pide)");
            System.out.println("Dia: ej.(01)");
            int Dia = sc.nextInt();

            System.out.println("Mes: ej.(01)");
            int Mes = sc.nextInt();

            System.out.println("Año: ej.(2000)");
            int Año = sc.nextInt();

            LocalDate hoy = LocalDate.now();

            edad = hoy.getYear() - Año;

            if (Mes > hoy.getMonthValue() || (Mes == hoy.getMonthValue() && Dia > hoy.getDayOfMonth())) {
                edad--;
            }

            if (edad < 18) {
                System.out.println("No puedes hacer uso de esta apicación");
                System.out.println("Debido a tu edad");
            } else {
                System.out.println("Bienvenido/a " + nombre);

                if (numeros.size() > 0) {
                    System.out.println("Mostrando los resultados  de tu lista anterior");
                    System.out.println("Media: " + media);
                    System.out.println("Mediana: " + mediana);
                    System.out.println("Moda: " + moda);
                }
            }

            System.out.println("\n¿Deseas repetir el programa? (Ingresa solo el número)");
            System.out.println("1. Sí");
            System.out.println("2. No repetir el programa");
            opcion = sc.nextInt();

        } while (opcion != 2);
    }
}