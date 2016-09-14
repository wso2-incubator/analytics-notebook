package org.wso2.carbon.notebook.commons.constants;


public class MLConstants {

    // feature settings
    public static final String DISCARD = "DISCARD";
    public static final String MEAN_IMPUTATION = "REPLACE_WTH_MEAN";
    private MLConstants() {

    }

    public enum MISSING_VALUES {
        EMPTY(""), NA("NA"), QUESTION("?"), NULL("null");

        private final String value;

        private MISSING_VALUES(final String str) {
            this.value = str;
        }

        public static boolean contains(String s) {
            for (MISSING_VALUES val : values()) {
                if (val.toString().equals(s)) {
                    return true;
                }
            }
            return false;
        }

        @Override
        public String toString() {
            return value;
        }
    }
}
