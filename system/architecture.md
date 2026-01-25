## System Architecture Diagram (Mermaid)
![system architecture diagram](IRIS\system\architecture.drawio.png)
```mermaid
flowchart TD
    U[User] --> F[Frontend Web / Mobile ]
    F --> B[Backend API Flask ]

    B --> M[AI Risk Prediction Model]
    M --> D[Crime Dataset]

    B --> R[Risk Alerts &<br/>Safe Route Engine]

    B --> V[Voice Alert System]
    V --> E[Emergency Contacts]
    