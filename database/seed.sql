-- FlexCampus Seed Data
-- Données initiales pour tester la plateforme

-- =============================================
-- THÉMATIQUES
-- =============================================
INSERT INTO themes (id, name, description, icon, color, order_index) VALUES
('ia-ml', 'Intelligence Artificielle', 'Découvrez le machine learning, le deep learning et les applications de l''IA moderne.', 'brain', '#8B5CF6', 1),
('cybersecurity', 'Cybersécurité', 'Apprenez à sécuriser les systèmes, détecter les menaces et protéger les données.', 'shield', '#EF4444', 2),
('cloud', 'Cloud Computing', 'Maîtrisez AWS, Azure, GCP et les architectures cloud modernes.', 'cloud', '#3B82F6', 3),
('dev', 'Développement', 'Programmation, frameworks modernes et bonnes pratiques de développement.', 'code', '#10B981', 4);

-- =============================================
-- TEMPLATES DE CONTAINERS
-- =============================================
INSERT INTO container_templates (id, name, description, image_tag, vnc_port, resources) VALUES
('linux-base', 'Linux Base', 'Environnement Linux Ubuntu avec outils de base', 'flexcampus/linux-base:latest', 5900, '{"cpu": "0.5", "memory": "512Mi", "timeout": 7200}'),
('python-dev', 'Python Development', 'Python 3.11 avec Jupyter, NumPy, Pandas, Scikit-learn', 'flexcampus/python-dev:latest', 5900, '{"cpu": "1", "memory": "1Gi", "timeout": 7200}'),
('kali-light', 'Kali Light', 'Kali Linux avec outils de sécurité essentiels', 'flexcampus/kali-light:latest', 5900, '{"cpu": "1", "memory": "2Gi", "timeout": 7200}'),
('cloud-cli', 'Cloud CLI', 'AWS CLI, Azure CLI, gcloud, Terraform', 'flexcampus/cloud-cli:latest', 5900, '{"cpu": "0.5", "memory": "512Mi", "timeout": 7200}');

-- =============================================
-- EXERCICES - IA/ML
-- =============================================
INSERT INTO exercises (id, theme_id, title, description, difficulty, duration_minutes, course_content, container_template_id, order_index) VALUES
('ia-intro-python', 'ia-ml', 'Introduction à Python pour le ML', 'Premiers pas avec Python, NumPy et Pandas pour la data science.', 'débutant', 45,
'# Introduction à Python pour le Machine Learning

## Objectifs
- Maîtriser les bases de Python
- Comprendre NumPy et les tableaux
- Manipuler des données avec Pandas

## 1. Python Basics

```python
# Variables et types
x = 10
name = "FlexCampus"
is_active = True
```

## 2. NumPy

```python
import numpy as np

# Créer un tableau
arr = np.array([1, 2, 3, 4, 5])
print(arr.mean())  # Moyenne
```

## 3. Pandas

```python
import pandas as pd

# Créer un DataFrame
df = pd.DataFrame({
    "nom": ["Alice", "Bob"],
    "age": [25, 30]
})
```

## Exercice Pratique
Ouvrez le lab et complétez les exercices dans le notebook Jupyter.
', 'python-dev', 1),

('ia-regression', 'ia-ml', 'Régression Linéaire', 'Comprendre et implémenter la régression linéaire avec Scikit-learn.', 'débutant', 60,
'# Régression Linéaire

## Objectifs
- Comprendre le concept de régression
- Implémenter avec Scikit-learn
- Évaluer un modèle

## Théorie
La régression linéaire modélise la relation entre une variable dépendante Y et une variable indépendante X.

## Implémentation

```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

# Données
X = [[1], [2], [3], [4]]
y = [2, 4, 6, 8]

# Modèle
model = LinearRegression()
model.fit(X, y)

# Prédiction
print(model.predict([[5]]))  # Devrait être proche de 10
```
', 'python-dev', 2),

('ia-neural-networks', 'ia-ml', 'Réseaux de Neurones', 'Introduction aux réseaux de neurones avec TensorFlow/Keras.', 'intermédiaire', 90,
'# Réseaux de Neurones

## Objectifs
- Comprendre l''architecture d''un réseau de neurones
- Créer un modèle avec Keras
- Entraîner sur MNIST

## Architecture
Un réseau de neurones est composé de couches de neurones connectés.

## Exemple avec Keras

```python
from tensorflow import keras

model = keras.Sequential([
    keras.layers.Dense(128, activation="relu"),
    keras.layers.Dense(10, activation="softmax")
])

model.compile(optimizer="adam", loss="sparse_categorical_crossentropy")
```
', 'python-dev', 3);

-- =============================================
-- EXERCICES - CYBERSÉCURITÉ
-- =============================================
INSERT INTO exercises (id, theme_id, title, description, difficulty, duration_minutes, course_content, container_template_id, order_index) VALUES
('cyber-linux-basics', 'cybersecurity', 'Fondamentaux Linux', 'Maîtrisez les commandes Linux essentielles pour la cybersécurité.', 'débutant', 45,
'# Fondamentaux Linux pour la Cybersécurité

## Objectifs
- Navigation dans le système de fichiers
- Gestion des permissions
- Commandes réseau de base

## Commandes Essentielles

```bash
# Navigation
cd /home
ls -la
pwd

# Fichiers
cat /etc/passwd
grep "root" /etc/passwd
find / -name "*.conf"

# Permissions
chmod 755 script.sh
chown user:group file.txt
```

## Réseau

```bash
# Informations réseau
ip addr
netstat -tuln
ss -tuln

# Connexions
ping google.com
traceroute google.com
```
', 'linux-base', 1),

('cyber-nmap', 'cybersecurity', 'Scan Réseau avec Nmap', 'Apprenez à scanner et analyser un réseau avec Nmap.', 'intermédiaire', 60,
'# Scan Réseau avec Nmap

## Objectifs
- Comprendre les types de scans
- Détecter les services
- Analyser les résultats

## Types de Scans

```bash
# Scan basique
nmap 192.168.1.1

# Scan de ports spécifiques
nmap -p 22,80,443 192.168.1.1

# Scan de services
nmap -sV 192.168.1.1

# Scan OS
nmap -O 192.168.1.1
```

## Bonnes Pratiques
⚠️ Ne scannez que des systèmes pour lesquels vous avez l''autorisation !
', 'kali-light', 2);

-- =============================================
-- EXERCICES - CLOUD
-- =============================================
INSERT INTO exercises (id, theme_id, title, description, difficulty, duration_minutes, course_content, container_template_id, order_index) VALUES
('cloud-intro-aws', 'cloud', 'Introduction à AWS', 'Découvrez les services fondamentaux d''Amazon Web Services.', 'débutant', 60,
'# Introduction à AWS

## Objectifs
- Comprendre les services AWS principaux
- Utiliser AWS CLI
- Créer des ressources de base

## Services Principaux
- **EC2** : Machines virtuelles
- **S3** : Stockage objet
- **RDS** : Bases de données
- **Lambda** : Serverless

## AWS CLI

```bash
# Configuration
aws configure

# Lister les buckets S3
aws s3 ls

# Lister les instances EC2
aws ec2 describe-instances
```
', 'cloud-cli', 1),

('cloud-terraform', 'cloud', 'Infrastructure as Code avec Terraform', 'Automatisez votre infrastructure avec Terraform.', 'intermédiaire', 90,
'# Terraform - Infrastructure as Code

## Objectifs
- Comprendre l''IaC
- Écrire des fichiers Terraform
- Déployer des ressources

## Exemple

```hcl
provider "aws" {
  region = "eu-west-1"
}

resource "aws_instance" "web" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
  }
}
```

## Commandes

```bash
terraform init
terraform plan
terraform apply
terraform destroy
```
', 'cloud-cli', 2);

-- =============================================
-- EXERCICES - DÉVELOPPEMENT
-- =============================================
INSERT INTO exercises (id, theme_id, title, description, difficulty, duration_minutes, course_content, container_template_id, order_index) VALUES
('dev-git', 'dev', 'Maîtriser Git', 'Versionnez votre code comme un pro avec Git.', 'débutant', 45,
'# Maîtriser Git

## Objectifs
- Comprendre les concepts Git
- Utiliser les commandes essentielles
- Travailler avec les branches

## Commandes de Base

```bash
# Initialiser un repo
git init

# Ajouter des fichiers
git add .
git commit -m "Initial commit"

# Branches
git branch feature
git checkout feature
git merge feature
```

## Workflow Recommandé
1. Créer une branche pour chaque feature
2. Commiter régulièrement
3. Pull request pour review
4. Merge après approbation
', 'linux-base', 1),

('dev-docker', 'dev', 'Conteneurisation avec Docker', 'Créez et déployez des applications conteneurisées.', 'intermédiaire', 75,
'# Docker - Conteneurisation

## Objectifs
- Comprendre les conteneurs
- Créer des Dockerfiles
- Utiliser Docker Compose

## Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["python", "app.py"]
```

## Commandes

```bash
# Build
docker build -t myapp .

# Run
docker run -p 8080:8080 myapp

# Liste
docker ps
docker images
```
', 'linux-base', 2);
