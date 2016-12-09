/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.notebook.core;

import org.wso2.carbon.analytics.dataservice.core.AnalyticsDataService;
import org.wso2.carbon.analytics.spark.core.AnalyticsProcessorService;
import org.wso2.carbon.analytics.spark.core.interfaces.SparkContextService;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.identity.authentication.AuthenticationService;
import org.wso2.carbon.registry.core.service.RegistryService;

/**
 * For holding services for the notebook
 */
public class ServiceHolder {
    private static AuthenticationService authenticationService;
    private static AnalyticsDataService analyticsDataService;
    private static AnalyticsProcessorService analyticsProcessorService;
    private static SparkContextService sparkContextService;
    private static RegistryService registryService;

    private ServiceHolder() {

    }

    public static AuthenticationService getAuthenticationService() {
        if (authenticationService == null) {
            authenticationService = (AuthenticationService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(AuthenticationService.class, null);
        }
        return authenticationService;
    }

    public static AnalyticsDataService getAnalyticsDataService() {
        if (analyticsDataService == null) {
            analyticsDataService = (AnalyticsDataService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(AnalyticsDataService.class, null);
        }
        return analyticsDataService;
    }

    public static AnalyticsProcessorService getAnalyticsProcessorService() {
        if (analyticsProcessorService == null) {
            analyticsProcessorService = (AnalyticsProcessorService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(AnalyticsProcessorService.class, null);
        }
        return analyticsProcessorService;
    }

    public static SparkContextService getSparkContextService() {
        if (sparkContextService == null) {
            sparkContextService = (SparkContextService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(SparkContextService.class, null);
        }
        return sparkContextService;
    }

    public static RegistryService getRegistryService() {
        if (registryService == null) {
            registryService = (RegistryService) PrivilegedCarbonContext.getThreadLocalCarbonContext()
                    .getOSGiService(RegistryService.class, null);
        }
        return registryService;
    }
}
