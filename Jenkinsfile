pipeline {
  agent any

  tools {
    nodejs 'node-20'
  }

  environment {
    SAUCE_USERNAME   = credentials('sauce-username')
    SAUCE_ACCESS_KEY = credentials('sauce-access-key')
    APP_URL          = 'https://www.saucedemo.com'
  }

  options {
  timestamps()
  disableConcurrentBuilds()
  timeout(time: 30, unit: 'MINUTES')
}

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main',
            credentialsId: 'mlmeghashree',
            url: 'https://github.com/mlmeghashree/sonarqube-playwright-cicd.git'
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }
stage('SonarQube analysis') {
  steps {
    withSonarQubeEnv('SonarQube') {
      script {
        def scannerHome = tool 'SonarScannerTool'

        withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
    sh """
    ${scannerHome}/bin/sonar-scanner \
    -Dsonar.projectKey=sonarqube-playwright-cicd \
    -Dsonar.sources=tests \
    -Dsonar.token=\$SONAR_TOKEN \
    -Dsonar.host.url=http://sonarqube:9000 \
    -Dsonar.exclusions=node_modules/**,playwright-report/**,test-results/**,coverage/**,dist/**,**/*.json \
    -Dsonar.scm.disabled=true
    """
        }
      }
    }
  }
}
  /*  stage('Quality Gate') {
  steps {
    timeout(time: 10, unit: 'MINUTES') {
      waitForQualityGate abortPipeline: true
    }
  }
}
*/

stage('Quality Gate') {
  steps {
    timeout(time: 10, unit: 'MINUTES') {
      script {
        def qg = waitForQualityGate()
        echo "Quality Gate: ${qg.status}"

        if (qg.status != 'OK') {
          error "Pipeline failed due to Quality Gate: ${qg.status}"
        }
      }
    }
  }
}
    stage('Playwright Tests') {
      steps {
        sh 'npx playwright install --with-deps chromium'
        sh 'npx playwright test'
      }
      post {
        always {
          junit 'results/junit-results.xml'
        }
      }
    }
  }

  post {
    success { echo 'Pipeline passed — Sonar gate clear, SauceDemo flows verified' }
    failure { echo 'Pipeline failed — check logs' }
  }
}