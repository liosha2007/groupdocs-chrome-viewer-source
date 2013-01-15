
jQuery(function (){
	GroupDocsPlugin.initialize();
});
// main object
var GroupDocsPlugin = {
	initialize: function (){
		// Initialize plugin
		this._initializeEvents();
		// Check is user logged
		if (localStorage['groupdocs_cid'] !== undefined && localStorage['groupdocs_pkey'] !== undefined){
			this.authSuccess(localStorage['groupdocs_cid'], localStorage['groupdocs_pkey']);
		}
	},
	_initializeEvents: function (){
		// Initialize logout button
		$('#logout').click(function (){
			GroupDocsPlugin.onLogout();
		});
		// Initialize tab switching
		$('.tab').each(function (index, elem){
	        $(elem).click(function (elem){
	        	GroupDocsPlugin.onTabSwitch(elem.srcElement);
	        });
	    });
		// Initialize auth button
		$('#authFormBtn').click(function (){
			GroupDocsPlugin.onAuth();
		});
		// Initialize show button
		$('#showBtn').click(function (){
			GroupDocsPlugin.onShowDocument();
		});
		// Initialize download button
		$('#downloadBtn').click(function (){
			GroupDocsPlugin.onDownloadDocument();
		});
		// Initialize rename button
		$('#renameBtn').click(function (){
			GroupDocsPlugin.onRenameDocument();
		});
		// Initialize find button
		$('#findId').click(function (){
			GroupDocsPlugin.findDocument();
		});
	},
	onLogout: function (){
		// Logout function
		delete localStorage['groupdocs_cid'];
		delete localStorage['groupdocs_pkey'];
		GroupDocsManager.cid = '';
		GroupDocsManager.pkey = '';
		$('#clientId').val('');
		$('#privateKey').val('');
		$('#authTable').show();
		$('#mainTable').hide();
	},
	onTabSwitch: function (elem){
		// Tab switching
        $('.selected-tab').removeClass('selected-tab');
        $(elem).addClass('selected-tab');
        var tabs2blocks = {
    	    listFilesTab: '#listFilesBlock', 
    	    showFileTab: '#showFileBlock',
    	    uploadFileTab: '#uploadFileBlock'
    	};
        for (var key in tabs2blocks){
            $(tabs2blocks[key]).hide();
        }
        $(tabs2blocks[$(elem).attr('id')]).show();
	},
	onAuth: function (){
		// Auth button clicked
		var cid = $('#clientId').val();
		var pkey = $('#privateKey').val();
		$('#authErrorMsg').hide();
		$('#authFormBtn').attr('disabled', 'disabled');
		GroupDocsManager.isCorrectCredentials(cid, pkey, function (isCorrect){
			$('#authFormBtn').removeAttr('disabled');
			if (isCorrect === true){
				if ($('#rememberMe').is(':checked')){
					localStorage['groupdocs_cid'] = cid;
					localStorage['groupdocs_pkey'] = pkey;
				}
				GroupDocsPlugin.authSuccess(cid, pkey);
			}
			else {
				$('#authErrorMsg').show();
			}
		});
	},
	authSuccess: function (cid, pkey){
		// Auth successed
		GroupDocsManager.cid = cid;
		GroupDocsManager.pkey = pkey;
		$('#authTable').hide();
		$('#mainTable').show();
		this.contentShowed();
	},
	contentShowed: function (){
		$('#filesTree').val('');
		this.showEntities('', $('#filesTree'));
	},
	showEntities: function (path, parent){
		GroupDocsManager.listEntities(path, function (folders, files){
    		var ul = $('<ul></ul>');
    		for (var n = 0; n < folders.length; n++){
    			var li = $('<li class="dir"></li>');
    			var div = $('<div>' + folders[n].name + '</div>');
    			div.click(GroupDocsPlugin.onFolder);
    			li.append(div);
    			GroupDocsPlugin.showEntities(path + folders[n].name + '/', li);
    			ul.append(li);
    		}
    		for (var n = 0; n < files.length; n++){
    			var li = $('<li class="file"></li>');
    			var div = $('<div id="' + files[n].guid + '">' + files[n].name + '</div>');
    			div.click(GroupDocsPlugin.onFile);
    			li.append(div);
    			GroupDocsPlugin.showEntities(path + files[n].name + '/', li);
    			ul.append(li);
    		}
    		parent.append(ul);
    	});
	},
	onFolder: function (){
		// Folder selected
		$('#filesTree').find('div.selected').removeClass('selected');
		$(this).addClass('selected');
		$('#fileId').val('');
		$('#showBtn, #downloadBtn, #copyBtn, #moveBtn, #renameBtn').attr('disabled', 'disabled');
	},
	onFile: function (){
		// File selected
		$('#filesTree').find('div.selected').removeClass('selected');
		$(this).addClass('selected');
		$('#fileId').val($(this).attr('id'));
		$('#showBtn, #downloadBtn, #copyBtn, #moveBtn, #renameBtn').removeAttr('disabled');
	},
	onShowDocument: function (){
		// Show document
        var src = 'https://dev-apps.groupdocs.com/document-viewer/Embed/' + $('#fileId').val() + '?quality=50&use_pdf=False&download=False';
        $('#previewFrame').attr('src', src);
        this.onTabSwitch($('#showFileTab'));
	},
	onDownloadDocument: function (){
		// Download document
		GroupDocsManager.downloadDocument($('#fileId').val(), function (url){
			$('#downloadFile').attr('src', url);
		});
	},
	onRenameDocument: function (){
		// Rename document
		var editableDiv = $('#filesTree').find('div.selected');
		if (editableDiv){
			var oldName = editableDiv.html();
			var elem = editableDiv;
			var path = '';
			while (elem.parent().parent().parent().attr('id') != 'filesTree') {
				elem = elem.parent().parent().parent().children('div');
				path = elem.html() + '/' + path;
			}
            editableDiv.addClass('editable');
            editableDiv.attr('contenteditable', true);
            editableDiv.focus();
            editableDiv.blur(function (){
            	var newName = $(editableDiv).html();
                editableDiv.removeClass('editable');
                editableDiv.removeAttr('contenteditable');
                GroupDocsManager.getDocumentMetadata($(editableDiv).attr('id'), function (docMetadata){
                	if (docMetadata.id !== undefined){
	                	GroupDocsManager.moveFile(path + newName, docMetadata.id, function (success, responce){
	                		if (success){
		                		alert(success);
	                		}
	                		else {
	                    		$(editableDiv).html(oldName);
	                		}
	                	});
                	}
                	else {
                		$(editableDiv).html(oldName);
                	}
                });
                return false;
            });
		}
	},
	findDocument: function (){
		$('#filesTree').find('div.selected').removeClass('selected');
		$('#filesTree').find('#' + $('#fileId').val()).click();
	}
};