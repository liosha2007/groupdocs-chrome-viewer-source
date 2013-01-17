
jQuery(function (){
	GroupDocsPlugin.initialize();
});
// main object
var GroupDocsPlugin = {
	filesCount: 0,
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
			return false;
		});
		// Initialize tab switching
		$('.tab').each(function (index, elem){
	        $(elem).click(function (elem){
	        	GroupDocsPlugin.onTabSwitch((elem.srcElement === undefined) ? elem.target : elem.srcElement);
				return false;
	        });
	    });
		// Initialize auth button
		$('#authFormBtn').click(function (){
			GroupDocsPlugin.onAuth();
			return false;
		});
		// Initialize show button
		$('#showBtn').click(function (){
			GroupDocsPlugin.onShowDocument();
			return false;
		});
		// Initialize download button
		$('#downloadBtn').click(function (){
			GroupDocsPlugin.onDownloadDocument();
			return false;
		});
		// Initialize rename button
		$('#renameBtn').click(function (){
			GroupDocsPlugin.onRenameDocument();
			return false;
		});
		// Initialize find button
		$('#findId').click(function (){
			GroupDocsPlugin.findDocument();
			return false;
		});
		// Initialize copy button
		$('#copyBtn').click(function (){
			GroupDocsPlugin.copyDocument();
			return false;
		});
		// Initialize move buttin
		$('#moveBtn').click(function (){
			GroupDocsPlugin.moveDocument();
			return false;
		});
		// Initialize delete button
		$('#deleteBtn').click(function (){
			GroupDocsPlugin.deleteDocument();
			return false;
		});
		// Initialize embed button
		$('#embedBtn').click(function (){
			GroupDocsPlugin.embedDocument();
			return false;
		});
		// Initialize file upload button
		$('#fileUploadBtn').click(function (){
			GroupDocsPlugin.uploadDocument();
			return false;
		});
		// Initialize default text functional
	    $(".default-text").focus(function(srcc){
			if ($(this).val() == $(this)[0].title){
				$(this).removeClass('default-text-active');
				$(this).val('');
			}
		});
		$('.default-text').blur(function(){
			if ($(this).val() == ''){
				$(this).addClass('default-text-active');
				$(this).val($(this)[0].title);
			}
		});
		$('.default-text').blur(); 
		// Initialize refresh button
		$('#refreshBtn').click(function (){
			GroupDocsPlugin.refreshDocumentList();
			return false;
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
		StatusManager.showProgress();
		var cid = $('#clientId').val();
		var pkey = $('#privateKey').val();
		$('#authErrorMsg').hide();
		$('#authFormBtn').attr('disabled', 'disabled');
		GroupDocsManager.isCorrectCredentials(cid, pkey, function (isCorrect){
			StatusManager.hideProgress();
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
		$('#filesTree').html('');
		this.showEntities('', $('#filesTree'));
	},
	showEntities: function (path, parent){
		GroupDocsPlugin.filesCount += 1;
		StatusManager.showProgress();
		GroupDocsManager.listEntities(path, function (success, folders, files, error_message){
			GroupDocsPlugin.filesCount -= 1;
			if (success){
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
			}
			else {
				StatusManager.err('listFilesStatus', error_message);
			}
			if (GroupDocsPlugin.filesCount == 0) {
				StatusManager.hideProgress();
			}
    	});
	},
	onFolder: function (){
		// Folder selected
		$('#filesTree').find('div.selected').removeClass('selected');
		$(this).addClass('selected');
		$('#fileId').val('');
		$('#showBtn, #downloadBtn, #copyBtn, #moveBtn, #renameBtn, #deleteBtn, #embedBtn').attr('disabled', 'disabled');
	},
	onFile: function (){
		// File selected
		$('#filesTree').find('div.selected').removeClass('selected');
		$(this).addClass('selected');
		$('#fileId').val($(this).attr('id'));
		$('#showBtn, #downloadBtn, #copyBtn, #moveBtn, #renameBtn, #deleteBtn, #embedBtn').removeAttr('disabled');
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
            	StatusManager.showProgress();
            	var newName = $(editableDiv).html();
                editableDiv.removeClass('editable');
                editableDiv.removeAttr('contenteditable');
                GroupDocsManager.getDocumentMetadata($(editableDiv).attr('id'), function (success, docMetadata, error_message){
                	if (success && docMetadata !== undefined && docMetadata.id !== undefined){
	                	GroupDocsManager.renameFile(path + newName, docMetadata.id, function (success, responce, error_message){
	                		StatusManager.hideProgress();
	                		if (success){
	                			StatusManager.scs('listFilesStatus', 'File renamed');
	                		}
	                		else {
	                    		$(editableDiv).html(oldName);
	                    		StatusManager.err('listFilesStatus', error_message);
	                		}
	                		GroupDocsPlugin.contentShowed();
	                	});
                	}
                	else {
                		$(editableDiv).html(oldName);
                		StatusManager.err('listFilesStatus', error_message);
                		StatusManager.hideProgress();
                	}
                });
                return false;
            });
            editableDiv.keydown(function (e){
            	if(e.keyCode == 13) {
            		$(editableDiv).blur();
            	}
            });
        }
	},
	findDocument: function (){
		$('#filesTree').find('div.selected').removeClass('selected');
		$('#filesTree').find('#' + $('#fileId').val()).click();
	},
	copyDocument: function (){
		// Copy button clicked
		var selectedDiv = $('#filesTree').find('div.selected');
		var fileName = selectedDiv.html();
		DirectoryChoicer.show();
		DirectoryChoicer.okButtonClick = function (){
			DirectoryChoicer.hide();
			StatusManager.showProgress();
			GroupDocsManager.getDocumentMetadata(selectedDiv.attr('id'), function (success, docMetadata, error_message){
				if (success && docMetadata !== undefined && docMetadata.id !== undefined){
					GroupDocsManager.copyFile(DirectoryChoicer.selected + fileName, docMetadata.id, function (success, responce, error_message){
						StatusManager.hideProgress();
                		if (success){
                			GroupDocsPlugin.contentShowed();
                			StatusManager.scs('listFilesStatus', 'File copied');
                		}
                		else {
                			StatusManager.err('listFilesStatus', error_message);
                		}
                	});
				}
				else {
					StatusManager.err('listFilesStatus', error_message);
					StatusManager.hideProgress();
				}
			});
		}
	},
	moveDocument: function (){
		// Move button clicked
		var selectedDiv = $('#filesTree').find('div.selected');
		var fileName = selectedDiv.html();
		DirectoryChoicer.show();
		DirectoryChoicer.okButtonClick = function (){
			DirectoryChoicer.hide();
			StatusManager.showProgress();
			GroupDocsManager.getDocumentMetadata(selectedDiv.attr('id'), function (success, docMetadata, error_message){
				if (success && docMetadata !== undefined && docMetadata.id !== undefined){
					GroupDocsManager.moveFile(DirectoryChoicer.selected + fileName, docMetadata.id, function (success, responce, error_message){
						StatusManager.hideProgress();
                		if (success){
                			GroupDocsPlugin.contentShowed();
                			StatusManager.scs('listFilesStatus', 'File moved');
                		}
                		else {
                			StatusManager.err('listFilesStatus', error_message);
                		}
                	});
				}
				else {
					StatusManager.err('listFilesStatus', error_message);
					StatusManager.hideProgress();
				}
			});
		}
	},
	deleteDocument: function (){
		// Delete button clicked
		var selectedDiv = $('#filesTree').find('div.selected');
		var fileName = selectedDiv.html();
		if (confirm('Delete file "' + fileName + '"?')){
			StatusManager.showProgress();
			GroupDocsManager.deleteFile(selectedDiv.attr('id'), function (success, responce, error_message){
				StatusManager.hideProgress();
        		if (success){
        			GroupDocsPlugin.contentShowed();
        			StatusManager.scs('listFilesStatus', 'File deleted');
        		}
        		else {
        			StatusManager.err('listFilesStatus', error_message);
        		}
			});
		}
	},
	embedDocument: function (){
		var selectedDiv = $('#filesTree').find('div.selected');
		EmbedDialog.show(selectedDiv.attr('id'));
	},
	uploadDocument: function (){
		// Upload file button clicked
		var file = $('#fileUpload')[0].files[0];
		if (file === undefined){
			StatusManager.err('uploadFileStatus', 'Please, select file to upload');
			return;
		}
		StatusManager.showProgress();
		var path = $('#uploadPath').val();
		path = (path == $('#uploadPath').attr('title')) ? '' : path;
		if (path.length > 0){
			path = (path[path.length - 1] == '/' || path[path.length - 1] == '\\') ? path : path + '/';
			path = (path[0] == '/' || path[0] == '\\') ? path.substr(1) : path;
		}
		var descr = $('#fileDescr').val();
		descr = (descr == $('#fileDescr').attr('title')) ? '' : descr;
		StatusManager.inf('uploadFileStatus', 'Start file upload');
		GroupDocsManager.uploadFile(file, path, descr, function (success, responce, error_message){
			StatusManager.hideProgress();
    		if (success){
    			GroupDocsPlugin.contentShowed();
    			StatusManager.scs('uploadFileStatus', 'File uploaded');
    			StatusManager.scs('listFilesStatus', 'File uploaded');
    			$('#fileUpload').val('');
    			$('#listFilesTab').click();
    		}
    		else {
    			StatusManager.err('uploadFileStatus', error_message);
    		}
		});
	},
	refreshDocumentList: function (){
		this.contentShowed();
	}
};
