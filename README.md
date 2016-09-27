# Notebook
---
This project contains a web app designed to be run in the [WSO2 Data Analytics Server](http://wso2.com/products/data-analytics-server/). Notebook provides a unified analytics tool that is capable of performing the following functions.

* Preprocessing Data
* Batch Analytics (Using spark queries)
* Interactive Analytics (Using lucene query, Primary keys, Timestamp range)
* Data Exploring (Scatter Plots, Trellis Charts, Parallel Sets, Cluster Diagrams)


### How to run

1. Download WSO2 Data Analytics Server ([Download binaries](http://wso2.com/products/data-analytics-server/) or [build from source](https://github.com/wso2/product-das)).
2. Download Notebook repository as a zip file and extract or clone the repository.
3. Go to the root directory of the Notebook and run `mvn clean install` to build the project
4. Copy \<NOTEBOOK_HOME>/components/org.wso2.carbon.notebook.commons/target/notebook-commons-\<VERSION>.jar & \<NOTEBOOK_HOME>/components/org.wso2.carbon.notebook.core/target/notebook-core-\<VERSION>.jar to \<WSO2_DAS_HOME>/repository/components/lib/ directory.
5. Copy \<NOTEBOOK_HOME>/components/org.wso2.carbon.notebook.api/target/notebook.war to \<NOTEBOOK_HOME>/repository/deployment/server/webapps/ directory.
6. Run the WSO2 Data Analytics Server
7. Go to https://\<SERVER_URI>:\<PORT>/notebook/index.html (Default port : 9443)
8. Use "admin" as both username and password to login as admin
