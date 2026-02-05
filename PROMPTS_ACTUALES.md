# Auditoría de Prompts de IA - Gym 3.0

Este documento contiene el detalle de los prompts enviados al modelo **Gemini 2.5 Flash** en los 12 ejercicios que integran inteligencia artificial.

---

## 👑 Área: LIDERAZGO

### 1. l3 - Dar Feedback Constructivo (Tipo B)
*   **Prompt Completo:**
    `Eres un coach ejecutivo experto. Evalúa esta respuesta con criterios profesionales. RESPUESTA DEL PARTICIPANTE: "${response}" Responde SOLO este JSON: { "scores": [85, 70, 90, 80], "feedback": "...", "aprobado": true }`
*   **Datos del Usuario:** Se inserta `${response}` (texto escrito por el participante).
*   **Formato JSON:** Un objeto con un array `scores` de 4 números (0-100), un string `feedback` y un boolean `aprobado`.

### 2. l4 - Mensaje Motivacional (Tipo B)
*   **Prompt Completo:**
    `Eres un coach de liderazgo. Evalúa este mensaje motivacional. Respuesta: "${response}". Responde SOLO JSON: { "scores": [0, 0, 0, 0], "feedback": "...", "aprobado": true }`
*   **Datos del Usuario:** Se inserta `${response}` (mensaje motivacional escrito por el participante).
*   **Formato JSON:** Un objeto con un array `scores` de 4 números, un string `feedback` y un boolean `aprobado`.

### 3. l5 - Gestión de Quiebres (Tipo C)
*   **Prompt Completo:**
    `Eres ${scenario.roleName}. ${scenario.personality} Situación: ${scenario.situation}. Historial: ${JSON.stringify(history)}. Usuario dice: "${lastUserMessage}". Responde EN PERSONAJE. Responde SOLO JSON: { "respuesta": "texto", "score": 80 }`
*   **Datos del Usuario:** Se inserta el historial de chat completo (`history`) y el último mensaje del usuario (`lastUserMessage`).
*   **Formato JSON:** Objeto con `respuesta` (texto del personaje) y `score` (progreso de la conversación).

### 4. l6 - Desarrollo de Personas (Tipo C)
*   **Prompt Completo:**
    `Eres ${scenario.roleName}. ${scenario.personality} Situación: ${scenario.situation}. Historial: ${JSON.stringify(history)}. Usuario dice: "${lastUserMessage}". Responde EN PERSONAJE. Responde SOLO JSON: { "respuesta": "texto", "score": 80 }`
*   **Datos del Usuario:** Historial de chat (`history`) y último mensaje (`lastUserMessage`).
*   **Formato JSON:** Objeto con `respuesta` y `score`.

---

## ⚡ Área: AUTOLIDERAZGO

### 5. a3 - Construyendo Resiliencia (Tipo B)
*   **Prompt Completo:**
    `Evalúa esta reflexión sobre resiliencia. Respuesta: "${response}". Responde SOLO JSON: { "scores": [0,0,0,0], "feedback": "...", "aprobado": true }`
*   **Datos del Usuario:** Se inserta `${response}` (reflexión sobre un caso de fracaso).
*   **Formato JSON:** Array `scores`, string `feedback`, boolean `aprobado`.

### 6. a4 - Matriz de Eisenhower (Tipo B)
*   **Prompt Completo:**
    `Evalúa esta clasificación Eisenhower. Respuesta: "${response}". Responde SOLO JSON: { "scores": [0,0,0,0], "feedback": "...", "aprobado": true }`
*   **Datos del Usuario:** Se inserta `${response}` (lista de tareas clasificadas).
*   **Formato JSON:** Array `scores`, string `feedback`, boolean `aprobado`.

### 7. a5 - Autorregulación (Tipo D)
*   **Prompt Completo:**
    `Eres un mentor sabio. Lee estas reflexiones: 1: "${answers[0]}" 2: "${answers[1]}" 3: "${answers[2]}". Genera un insight profundo que conecte sus respuestas y sugiera una práctica de mindfulness. Tono cálido.`
*   **Datos del Usuario:** Se insertan las 3 respuestas a las preguntas de reflexión (`answers`).
*   **Formato JSON:** **No solicita JSON.** Devuelve texto plano con un insight.

### 8. a6 - Influencia Personal (Tipo D)
*   **Prompt Completo:**
    `Eres un mentor de liderazgo. Reflexiones del usuario: ${JSON.stringify(answers)}. Genera un insight sobre su estilo de influencia y cómo potenciarlo.`
*   **Datos del Usuario:** Se inserta el array de respuestas de reflexión (`answers`).
*   **Formato JSON:** **No solicita JSON.** Devuelve texto plano.

---

## 🤝 Área: NEGOCIACIÓN

### 9. n3 - Responder Objeciones (Tipo B)
*   **Prompt Completo:**
    `Evalúa esta manejo de objeción. Respuesta: "${response}". Responde SOLO JSON: { "scores": [0,0,0,0], "feedback": "...", "aprobado": true }`
*   **Datos del Usuario:** Se inserta `${response}` (respuesta a la objeción de precio).
*   **Formato JSON:** Array `scores`, string `feedback`, boolean `aprobado`.

### 10. n4 - Cerrar Negociación (Tipo B)
*   **Prompt Completo:**
    `Evalúa este cierre de negociación. Respuesta: "${response}". Responde SOLO JSON: { "scores": [0,0,0,0], "feedback": "...", "aprobado": true }`
*   **Datos del Usuario:** Se inserta `${response}` (mensaje de cierre formalizando compromisos).
*   **Formato JSON:** Array `scores`, string `feedback`, boolean `aprobado`.

### 11. n5 - Negociación con Cliente Difícil (Tipo C)
*   **Prompt Completo:**
    `Eres ${scenario.roleName}. ${scenario.personality} Situación: ${scenario.situation}. Historial: ${JSON.stringify(history)}. Usuario dice: "${lastUserMessage}". Responde EN PERSONAJE. Responde SOLO JSON: { "respuesta": "texto", "score": 80 }`
*   **Datos del Usuario:** Historial de chat (`history`) y último mensaje (`lastUserMessage`).
*   **Formato JSON:** Objeto con `respuesta` y `score`.

### 12. n6 - Negociación Interna - Recursos (Tipo C)
*   **Prompt Completo:**
    `Eres ${scenario.roleName}. ${scenario.personality} Situación: ${scenario.situation}. Historial: ${JSON.stringify(history)}. Usuario dice: "${lastUserMessage}". Responde EN PERSONAJE. Responde SOLO JSON: { "respuesta": "texto", "score": 80 }`
*   **Datos del Usuario:** Historial de chat (`history`) y último mensaje (`lastUserMessage`).
*   **Formato JSON:** Objeto con `respuesta` y `score`.
