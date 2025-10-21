oc apply -f openshift/buildconfig.yaml # Create or update the BuildConfig
oc apply -f openshift/imagestream.yaml # Create or update the ImageStream
oc apply -f openshift/nextjs-dashboard-secret.yaml # Create or update the Secret

#oc -n jackie set env deployment/nextjs-dashboard --from=secret/nextjs-dashboard-secret # Set environment variables from the Secret
oc apply -f openshift/deployment.yaml # Create or update the Deployment
oc apply -f openshift/service.yaml # Create or update the Service

#oc expose svc/nextjs-dashboard -n jackie # Expose a route to access the app
#oc -n jackie get route nextjs-dashboard # Get the URL of the app
oc apply -f openshift/route.yaml # Create or update the Route

oc get pods -n jackie --selector app=nextjs-dashboard -o jsonpath="{range .items[*]}{.metadata.name}{'  SA='}{.spec.serviceAccountName}{'\n'}{end}"