package it.eng.spagobi.tools.dataset;

import it.eng.spagobi.tools.dataset.bo.IDataSet;
import it.eng.spagobi.tools.dataset.cache.ICache;
import it.eng.spagobi.tools.dataset.cache.SpagoBICacheConfiguration;
import it.eng.spagobi.tools.dataset.cache.SpagoBICacheManager;
import it.eng.spagobi.tools.dataset.graph.EdgeGroup;
import it.eng.spagobi.tools.dataset.graph.LabeledEdge;
import it.eng.spagobi.tools.datasource.bo.IDataSource;
import it.eng.spagobi.utilities.cache.CacheItem;
import it.eng.spagobi.utilities.exceptions.SpagoBIRuntimeException;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.jgrapht.graph.Pseudograph;

public class AssociativeLogicManager {

	private final static int IN_CLAUSE_LIMIT = 999;

	private final IDataSource dataSource;
	private final ICache cache;
	private Map<EdgeGroup, Set<String>> edgeGroupValues;
	private final Map<String, Map<String, String>> datasetToAssociations;
	private Map<String, Set<EdgeGroup>> datasetToEdgeGroup;
	private Map<EdgeGroup, Set<String>> edgeGroupToDataset;
	private final Pseudograph<String, LabeledEdge<String>> graph;
	private final Map<String, IDataSet> datasets;

	private final String datasetSelected;
	private final String filterSelected;

	public AssociativeLogicManager(Pseudograph<String, LabeledEdge<String>> graph, Map<String, IDataSet> datasets,
			Map<String, Map<String, String>> datasetToAssociations, String datasetSelected, String filterSelected) {
		this.dataSource = SpagoBICacheConfiguration.getInstance().getCacheDataSource();
		this.cache = SpagoBICacheManager.getCache();
		this.graph = graph;
		this.datasets = datasets;
		this.datasetToAssociations = datasetToAssociations;
		this.datasetSelected = datasetSelected;
		this.filterSelected = filterSelected;
	}

	public Map<EdgeGroup, Set<String>> process() throws Exception {

		if (dataSource == null) {
			// eccezione
		}
		if (cache == null) {
			// eccezione
		}

		// (0) generate the starting set of values for each associations
		init();

		// (1) user click on widget -> selection!
		calculateDatasets(datasetSelected, null, filterSelected);

		// String inLastnameValues = "'" + StringUtils.join(associationValues.get("LNAME").iterator(), "','") + "'";
		// System.out.println("LNAME [" + inLastnameValues + "]");

		return edgeGroupValues;
	}

	private void init() {
		edgeGroupValues = new HashMap<EdgeGroup, Set<String>>();
		datasetToEdgeGroup = new HashMap<String, Set<EdgeGroup>>();
		edgeGroupToDataset = new HashMap<EdgeGroup, Set<String>>();

		try {
			for (String v1 : graph.vertexSet()) {
				datasetToEdgeGroup.put(v1, new HashSet<EdgeGroup>());
				for (String v2 : graph.vertexSet()) {
					if (!v1.equals(v2)) {
						Set<LabeledEdge<String>> edges = graph.getAllEdges(v1, v2);
						if (!edges.isEmpty()) {
							EdgeGroup group = new EdgeGroup(edges);
							datasetToEdgeGroup.get(v1).add(group);

							CacheItem cacheItem = cache.getMetadata().getCacheItem(v1);
							String tableName = cacheItem.getTable();
							// PreparedStatement stmt = getPreparedQuery(dataSource.getConnection(), columnNames, cacheItem.getTable());
							Statement stmt = dataSource.getConnection().createStatement();
							ResultSet rs;
							rs = stmt.executeQuery("SELECT DISTINCT " + group.getColumnNames() + " FROM " + tableName);
							Set<String> tuple = getTupleOfValues(rs);

							if (!edgeGroupValues.containsKey(group)) {
								edgeGroupValues.put(group, tuple);
							} else {
								edgeGroupValues.get(group).retainAll(tuple);
							}

							if (!edgeGroupToDataset.containsKey(group)) {
								edgeGroupToDataset.put(group, new HashSet<String>());
								edgeGroupToDataset.get(group).add(v1);
							} else {
								edgeGroupToDataset.get(group).add(v1);
							}
						}
					}
				}
			}
		} catch (Throwable t) {
			throw new SpagoBIRuntimeException("Error during the initializing of the AssociativeLogicManager", t);
		}
	}

	@SuppressWarnings("unchecked")
	private void calculateDatasets(String dataset, EdgeGroup fromEdgeGroup, String filter) throws Exception {

		Set<EdgeGroup> groups = datasetToEdgeGroup.get(dataset);
		// ******* CHECK THIS ******* //
		// no need to iterate over the incoming association -> TO BE CHECKED
		// datasetAssociation.remove(fromAssociation);
		// *******FINISH CHECK THIS ******* //

		// iterate over all the associations
		for (EdgeGroup group : groups) {
			String query = "SELECT DISTINCT " + group.getColumnNames() + " FROM " + dataset + " WHERE " + filter;
			ResultSet rs = dataSource.getConnection().createStatement().executeQuery(query);
			// ResultSetMetaData rsMetadata = rs.getMetaData(); // maybe we do not need it: we handle everything as strings
			Set<String> distinctValues = getTupleOfValues(rs);

			// Map<String, Class> classes = new HashMap<String, Class>(group.getEdgeNames().size());
			// for (int i = 1; i < rsMetadata.getColumnCount(); i++) {
			// String columnName = rsMetadata.getColumnName(i);
			// Class columnClass = Class.forName(rsMetadata.getColumnClassName(i));
			// classes.put(columnName, columnClass);
			// }

			Set<String> baseSet = edgeGroupValues.get(group);
			Set<String> intersection = new HashSet<String>(CollectionUtils.intersection(baseSet, distinctValues));
			if (!intersection.equals(baseSet)) {
				edgeGroupValues.put(group, intersection);
				Set<String> values = edgeGroupValues.get(group);
				String inClauseColumns;
				String inClauseValues;
				if (values.size() > IN_CLAUSE_LIMIT) {
					inClauseColumns = "1," + group.getColumnNames();
					inClauseValues = getUnlimitedInClauseValues(values);
				} else {
					inClauseColumns = group.getColumnNames();
					inClauseValues = StringUtils.join(values.iterator(), "','");
				}

				String f = "(" + inClauseColumns + ") IN (" + inClauseValues + ")";
				for (String datasetInvolved : edgeGroupToDataset.get(group)) {
					if (!datasetInvolved.equals(dataset)) {
						// it will skip the current dataset, from which the filter is fired
						calculateDatasets(datasetInvolved, group, f);
					}
				}
			}
		}
	}

	private String getUnlimitedInClauseValues(Set<String> values) {
		Set<String> newValues = new HashSet<String>();
		for (String value : values) {
			newValues.add(value.replaceFirst("(", "(1,"));
		}
		return StringUtils.join(newValues.iterator(), "','");
	}

	private Set<String> getTupleOfValues(ResultSet rs) throws SQLException {
		String tupla;
		String stringDelimiter = "'";
		Set<String> tuple = new HashSet<String>();
		while (rs.next()) {
			tupla = "(";
			for (int i = 1; i <= rs.getMetaData().getColumnCount(); i++) {
				if (i != 1) {
					tupla += ",";
				}
				Object item = rs.getObject(i);
				tupla += stringDelimiter + (item == null ? null : item.toString()) + stringDelimiter;
			}
			tupla += ")";
			tuple.add(tupla);
		}
		return tuple;
	}

	// @SuppressWarnings("unused")
	// private PreparedStatement getPreparedQuery(Connection connection, String[] columnNames, String tableName) throws SQLException {
	// StringBuilder sb = new StringBuilder();
	// sb.append("SELECT DISTINCT");
	// sb.append(" ");
	// for (int i = 0; i < columnNames.length; i++) {
	// if (i != 0) {
	// sb.append(",");
	// }
	// sb.append("?");
	// }
	// sb.append("FROM");
	// sb.append(" ");
	// sb.append(tableName);
	// return connection.prepareStatement(sb.toString());
	// }
}
