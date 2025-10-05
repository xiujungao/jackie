# Deploy persistent volume to OpenShift
# You won't see any content of pv from your application.
# You can only use pvc to claim the pv.
oc apply -f .\openshift\pv.yaml

# Deploy persistent volume claim to OpenShift
oc apply -f .\openshift\pvc.yaml

oc get pods -n jackie --selector app=hello-world -o jsonpath="{range .items[*]}{.metadata.name}{'  SA='}{.spec.serviceAccountName}{'\n'}{end}"