# Set variables
$AppName = "hello-world"  # Name of your application
$ImageStream = "registry.access.redhat.com/ubi8/openjdk-21:1.18"

# Log in to CRC OpenShift (make sure CRC is running)
crc console --credentials
oc login -u developer -p developer https://api.crc.testing:6443

# Create a new project (namespace) for your application
# If the project already exists, this will not create a new one
# You can also use `oc project jackie` to switch to an existing project
oc new-project jackie *> $null

# Delete a BuildConfig named 'hello-world'
oc delete bc $AppName *> $null

# Delete all builds for that BuildConfig
oc delete build -l buildconfig=hello-world *> $null

# Delete an ImageStream named 'hello-world'
oc delete is hello-world *> $null

# Import the image into an ImageStream first
# oc import-image openjdk-21-runtime:1.18 --from=ImageStream --confirm
# Create a new build config using the local image
# oc new-build openjdk-21-runtime:1.18 --name=hello-world https://github.com/xiujungao/jackie.git --context-dir=spring-boot-hello-world --strategy=source

# Create a new build config using the remote image
oc new-app $ImageStream --name=$AppName https://github.com/xiujungao/jackie.git --context-dir=spring-boot-hello-world --strategy=source
#oc new-app registry.access.redhat.com/ubi8/openjdk-21:1.18 --name=hello-world https://github.com/xiujungao/jackie.git --context-dir=spring-boot-hello-world --strategy=source

# This step can be break down into two steps:
# oc create imagestream $AppName
# oc create buildconfig hello-world \
#  --image-stream=ubi8/openjdk-21:1.18 \
#  --strategy=source \
#  --source-repo=https://github.com/xiujungao/jackie.git \
#  --source-context-dir=spring-boot-hello-world \
#  --to-image-stream=hello-world:latest



# Monitor the build
# This may take a few minutes the first time, as it clones the repo, runs Maven (or Gradle if applicable), and builds the image
oc logs -f buildconfig/$AppName

# Once the build succeeds, the app will deploy as a pod. Check the status
oc get pods

# Expose a route to access the app
oc expose svc/$AppName

# Expose a route with TLS/SSL
oc create route edge $AppName --service=$AppName --port=8080 #--cert=path/to/cert.crt --key=path/to/key.key --ca-cert=path/to/ca.crt

# Get the URL of the app
# NAME          HOST/PORT                             PATH   SERVICES      PORT       TERMINATION   WILDCARD
# hello-world   hello-world-jackie.apps-crc.testing          hello-world   8080-tcp                 None
# http://hello-world-jackie.apps-crc.testing/
oc get route $AppName


# after make change to the code, you can run the following command to trigger a new build
# after the buld is done, you can access the app at the URL provided by the route command
# nothing else to do, the app will be automatically redeployed
oc start-build $AppName --follow -n jackie

# Scale the deployment to have 2 replicas 
oc autoscale deployment hello-world  --cpu-percent=80 --min=2 --max=10