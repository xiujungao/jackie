# Set variables
$AppName = "hello-world"  # Name of your application
$ImageStream = "registry.redhat.io/ubi8/openjdk-21-runtime:1.18"

# Log in to CRC OpenShift (make sure CRC is running)
crc console --credentials
oc login -u developer -p developer https://api.crc.testing:6443

# Delete a BuildConfig named 'hello-world'
oc delete bc $AppName *> $null

# Delete all builds for that BuildConfig
oc delete build -l buildconfig=hello-world *> $null

# Delete an ImageStream named 'hello-world'
oc delete is hello-world *> $null

# Create a new build config using the local image
oc new-build $ImageStream --name=$AppName --binary=false --strategy=source https://github.com/xiujungao/jackie.git --context-dir=spring-boot-hello-world

# Start a binary build from your local project directory
oc start-build $AppName --follow

# Deploy the built image
oc new-app $AppName

# Expose a route to access the app
oc expose svc/$AppName

# Get the URL of the app
oc get route $AppName --template='{{ .spec.host }}'