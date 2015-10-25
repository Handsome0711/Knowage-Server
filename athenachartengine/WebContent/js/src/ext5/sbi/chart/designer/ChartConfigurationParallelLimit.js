Ext.define
(
	"Sbi.chart.designer.ChartConfigurationParallelLimit", 
	
	{
		extend: 'Ext.panel.Panel',
		id: "chartParallelLimit",
		
		/**
		 * NOTE: 
		 * This is a temporal solution (for bugs ATHENA-154 and ATHENA-157):
		 * Instead of using dynamic width for this panel that relies
		 * on the width of the width of the window of the browser, fix this
		 * value so it can be entirely visible to the end user. Also the
		 * height will be defined as the fixed value.
		 * 
		 * @author: danristo (danilo.ristovski@mht.net)
		 */
//		columnWidth: 0.3,
		width: 290,
		height: 150,
		
		title: LN("sbi.chartengine.configuration.parallel.limit.title"),
		bodyPadding: 10,
		items: [],
		
	
	    fieldDefaults: 
	    {
	        anchor: '100%'
		},
		
		layout: 
		{
		    type: 'vbox'
		},
		
		constructor: function(config) 
		{
			this.callParent(config);
			this.viewModel = config.viewModel;
			
			var globalScope = this;
			
			this.storeForSeriesBeforeDrop = Ext.data.StoreManager.lookup('storeForSeriesBeforeDrop');
			
			/* We are communicating with the ChartColumnsContainerManager.js for additional
			 * serie columns or for the removed ones (after loading of the Designer). */			
			this.seriesColumnsOnYAxisCombo = Ext.create
			(
				'Ext.form.ComboBox', 
				{
				    fieldLabel: LN("sbi.chartengine.configuration.parallel.limit.serieFilterColumn"),	
				    bind : '{configModel.serieFilterColumn}',
				    store: this.storeForSeriesBeforeDrop,
				    editable : false,
				    queryMode: 'local',
				    displayField: 'serieColumn',
				    valueField: 'serieColumn',
				    
				    /**
				     * Listen if currently selected serie is removed from the serie (Y-axis) panel. If it is,
				     * clean the combo box - no selected item.
				     * 
				     * @author: danristo (danilo.ristovski@mht.net)
				     */
				    listeners: 
				    {
				    	serieRemoved: function(serieRemoved)
				    	{	
				    		if  (serieRemoved == globalScope.viewModel._data.configModel.data.serieFilterColumn)
			    			{
				    			globalScope.viewModel._data.configModel.data.serieFilterColumn = "";
				    			this.setViewModel(globalScope.viewModel);
				    			this.setBind('{configModel.serieFilterColumn}');	// refresh the binding
			    			}
				    	}
				    }
				}
			);
			
			this.maxNumberOfLines = Ext.create
			(
				{
					 xtype: 'numberfield',
					 bind : '{configModel.maxNumberOfLines}',
					 id: "parallelLimitMaxNumbOfRec",
					 fieldLabel: LN("sbi.chartengine.configuration.parallel.limit.maxNumberOfLines"),	
					 width: "200",
					 //value: "100",
					 maxValue: '1000',
					 minValue: '5'
				}
			);
			
			this.orderTopMinBottomMax = Ext.create 
			(								
				/* Combobox for POSITION of the TOOLBAR (top, bottom) */
	         	{
	         		xtype : 'combo',
	         		queryMode : 'local',
	         		//value : 'bottom',
	         		triggerAction : 'all',
	         		forceSelection : true,
	         		editable : false,
	         		fieldLabel : LN("sbi.chartengine.configuration.parallel.limit.orderTopMinBottomMax"), 
	         		bind : '{configModel.orderTopMinBottomMax}',
	         		displayField : 'name',
	         		valueField : 'value',
            		 
            		 store: 
            		 {
            			 fields : ['name', 'value'],
            			 
            			 data : 
        				 [ 
            				   {
            					   name : LN('sbi.chartengine.configuration.position.b'),	
            					   value : 'bottom'
            				   }, 
            				   
            				   {
            					   name : LN('sbi.chartengine.configuration.position.t'),	
            					   value : 'top'
            				   }
        				   ]
            		 }
	         	}
			 );
						
			this.add(this.seriesColumnsOnYAxisCombo);
			this.add(this.maxNumberOfLines);			
			this.add(this.orderTopMinBottomMax);
		},
		
		addItem: function(data)
		{
			this.seriesColumnsOnYAxisCombo.getStore().add(data);
		},
		
		removeItem: function(data)
		{
			this.seriesColumnsOnYAxisCombo.getStore().remove(data);
		}
});