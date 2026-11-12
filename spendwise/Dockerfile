FROM eclipse-temurin:25-jdk AS build

WORKDIR /app

COPY . .

RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
