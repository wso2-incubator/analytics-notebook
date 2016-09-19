package org.wso2.carbon.notebook.commons.response.dto;

public class Note {
    private String name;
    private String runningStatus;
    private String deployedStatus;

    public Note(String name, String runningStatus, String deployedStatus) {
        this.name = name;
        this.runningStatus = runningStatus;
        this.deployedStatus = deployedStatus;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRunningStatus() {
        return runningStatus;
    }

    public void setRunningStatus(String runningStatus) {
        this.runningStatus = runningStatus;
    }

    public String getDeployedStatus() {
        return deployedStatus;
    }

    public void setDeployedStatus(String deployedStatus) {
        this.deployedStatus = deployedStatus;
    }
}
