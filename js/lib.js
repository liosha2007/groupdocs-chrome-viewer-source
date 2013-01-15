// Choice directory manager
var DirectoryChoicer = {
    titleMessage: 'Please, select directory in witch you want to copy file:',
    okButtonMessage: 'Select',
    cancelButtonMessage: 'Cancel',
    dialogId: 'dir-choice',
    data: {},
    selected: null,
    html: null,
    show: function (){
        // Show dialog
        this.html = {};
        this.html.dialogDiv = $('<div id="' + this.dialogId + '" class="dir-choicer-root-div"></div>');
        this.html.dialogTitleDiv = $('<div class="div-choicer-title-div">' + this.titleMessage + '</div>');
        this.html.dialogContentDiv = $('<div id="' + this.dialogId + '-content"></div>');
        this.html.dialogButtonBlockDiv = $('<div class="div-choicer-button-block"></div>');
        this.html.okButton = $('<input type="button" id="' + this.dialogId + '-ok-button" class="div-choicer-button-ok" value="' + this.okButtonMessage + '" />');
        this.html.cancelButton = $('<input type="button" id="' + this.dialogId + '-cancel-button" class="div-choicer-button-cancel" value="' + this.cancelButtonMessage + '" />');
        
        this.html.dialogDiv.append(this.html.dialogTitleDiv);
        this.html.dialogDiv.append(this.html.dialogContentDiv);
        this.html.dialogDiv.append(this.html.dialogButtonBlockDiv);
        this.html.dialogButtonBlockDiv.append(this.html.okButton);
        this.html.dialogButtonBlockDiv.append(this.html.cancelButton);
        this.html.okButton.click(function (){ DirectoryChoicer.okButtonClick(); });
        this.html.cancelButton.click(function (){ DirectoryChoicer.cancelButtonClick(); });
        this.html.dialogDiv.appendTo('body');
        this.showDirs('', this.html.dialogContentDiv);
    },
    hide: function (){
        // Hide dialog
        if (this.html != null && this.html.dialogDiv !== undefined){
            this.html.dialogDiv.remove();
            this.html = null;
        }
    },
    okButtonClick: function () {
        // Default ok button handler
        this.hide();
    },
    cancelButtonClick: function (){
        // Default cancel button handler
        this.hide();
    },
    showDirs: function (path, parent){
    	// Load elems by path to parent element
    	GroupDocsManager.listEntities(path, function (folders, files){
    		var ul = $('<ul></ul>');
    		if (path.length == 0) {
    			folders.reverse().push({ name: '.' }); folders.reverse();
    		}
    		for (var n = 0; n < folders.length; n++){
    			var li = $('<li class="dir"></li>');
    			var div = $('<div>' + folders[n].name + '</div>');
    			div.click(DirectoryChoicer.onFolder);
    			li.append(div);
    			DirectoryChoicer.showDirs(path + folders[n].name + '/', li);
    			ul.append(li);
    		}
    		parent.append(ul);
    	});
    },
    onFolder: function (){
    	DirectoryChoicer.html.dialogContentDiv.find('div.selected').removeClass('selected');
    	$(this).addClass('selected');
    	if ($(this).html() == '.'){
    		DirectoryChoicer.selected = '';
    	}
    	else {
    		DirectoryChoicer.selected = $(this).html() + '/';
    		var elem = $(this);
    		while (elem.parent().parent().parent().attr('id') != DirectoryChoicer.dialogId + '-content'){
    			elem = elem.parent().parent().parent().children('div');
    			DirectoryChoicer.selected = elem.html() + '/' + DirectoryChoicer.selected;
    		}
    	}
    }
};

// GroupDocs manager
var GroupDocsManager = {
	cid: '',
	pkey: '',
	server: 'https://dev-api.groupdocs.com/v2.0',
	_createApiClient: function (pkey){
		pkey = (pkey === undefined) ? this.pkey : pkey;
		return new groupdocs.ApiClient(new groupdocs.GroupDocsSecurityHandler(pkey));
	},
	isCorrectCredentials: function (cid, pkey, callback){
		cid = (cid === undefined) ? this.cid : cid;
		var apiClient = this._createApiClient(pkey);
		var storageApi = new groupdocs.StorageApi(apiClient, this.server);
		storageApi.GetStorageInfo(function(response) {
			callback(response.status == "Ok");
		}, cid);
	},
	listEntities: function (path, callback){
		// List documents and folders 
		var apiClient = this._createApiClient(this.pkey);
		var storageApi = new groupdocs.StorageApi(apiClient, this.server);
		storageApi.ListEntities(function(response, status, jqXHR) {
			if (response.status == 'Ok'){
				callback(response.result.folders, response.result.files);
			}
		}, GroupDocsManager.cid, path);
	},
	downloadDocument: function (fileId, callback){
		// Get download document url
		var apiClient = this._createApiClient(this.pkey);
		var storageApi = new groupdocs.StorageApi(apiClient, this.server);
		storageApi.GetFile(function(response) {
			callback(response);
		}, this.cid, fileId);
	},
	getDocumentMetadata: function (fileId, callback){
		// Get Document metadata
		var apiClient = this._createApiClient(this.pkey);
		var docApi = new groupdocs.DocApi(apiClient, this.server);
		docApi.GetDocumentMetadata(function (response, status, jqXHR){
			callback(response.result);
		}, this.cid, fileId);
	},
	renameFile: function (filePath, idFile, callback){
		// Move file
		var apiClient = this._createApiClient(this.pkey);
		var storageApi = new groupdocs.StorageApi(apiClient, this.server);
		storageApi.MoveFile({
			onResponse: function(response, status, jqXHR) {
				callback(response.status == 'Ok', response);
			},
			onError: function(response, status, jqXHR) {
				callback(false, response);
			}
		}, this.cid, filePath, null, null, idFile);
	},
	copyFile: function (filePath, idFile, callback){
		// Move file
		var apiClient = this._createApiClient(this.pkey);
		var storageApi = new groupdocs.StorageApi(apiClient, this.server);
		storageApi.MoveFile({
			onResponse: function(response, status, jqXHR) {
				callback(response.status == 'Ok', response);
			},
			onError: function(response, status, jqXHR) {
				callback(false, response);
			}
		}, this.cid, filePath, null, idFile, null);
	}
};
