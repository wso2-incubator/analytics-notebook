package org.wso2.carbon.notebook.core.ml.transformation;


import org.apache.spark.api.java.function.Function;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.RowFactory;

public class StringArrayToRow implements Function<String[], Row> {

    private static final long serialVersionUID = 6885775018049837606L;

    private StringArrayToRow() {
    }

    @Override
    public Row call(String[] tokens) throws Exception {
        Object[] objectArrayForRow = new Object[tokens.length];
        for (int i = 0; i < tokens.length; i++) {
            objectArrayForRow[i] = tokens[i];
        }
        return RowFactory.create(objectArrayForRow);

    }

    public static class Builder {
        public StringArrayToRow build() {
            return new StringArrayToRow();
        }
    }
}



