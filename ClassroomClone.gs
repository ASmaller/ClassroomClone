function ClassroomClone() {
  try {
    const response = Classroom.Courses.list();
    const courses = response.courses;
    if (!courses || courses.length === 0) {
      console.log('No courses found.');
      return;
    }

    console.log("Courses:", courses.length)
    for (let i = 0; i < courses.length; i++) {
      workMaterials = Classroom.Courses.CourseWorkMaterials.list(courses[i].id).courseWorkMaterial;
      try {
        console.log(courses[i].name)
        for (j = 0, notRun = true; j < workMaterials.length; j++) {
          if(notRun) {
            console.log(courses[i].name, workMaterials[j].title);
            console.log("Index", i, j);
            getFile(courses[i].name, workMaterials[j].title, "post", workMaterials[j])
            notRun = false;
          }
          getFile(courses[i].name, workMaterials[j].title, workMaterials[j].materials, null); //getFile(courseName, postName, materials)
        }
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    // TODO (developer)- Handle Courses.list() exception from Classroom API
    console.log('Failed with error %s', err.message);
  }
}
function getFile(courseName, postName, materials, post) {
  try {
    const rootFolder = DriveApp.getRootFolder().getFoldersByName('***FOLDER NAME***').next();

    let courseFolder = rootFolder.getFoldersByName(courseName);     //Set the course folder
    if (courseFolder.hasNext()) {                                   //
    } else {                                                        //
      rootFolder.createFolder(courseName);                          //
    }                                                               //
    courseFolder = rootFolder.getFoldersByName(courseName).next();  //

    let postFolder = courseFolder.getFoldersByName(postName);       //Set the post folder
    if (postFolder.hasNext()) {                                     //
    } else {                                                        //
      courseFolder.createFolder(postName);                          //
    }                                                               //
    postFolder = courseFolder.getFoldersByName(postName).next();    //

    if (materials != "post") {
      for (i = 0; i < materials.length; i++) {
        var files = postFolder.getFiles();
        var fileExists = false
        var rawExists = false
        var downloadedExists = false
        while (files.hasNext()) {
          var file = files.next();
          if(Object.keys(materials[i])[0] == 'link') {
            if (file.getName() == materials[i].link.title+"RAW.txt") {
              rawExists = true;
            }
            if (file.getName() == materials[i].link.title+"DOWNLOADED") {
              downloadedExists = true;
            }
            if (rawExists + downloadedExists == 2) {
              fileExists = true;
            }
          } else if (Object.keys(materials[i])[0] == 'youtubeVideo'){
            if (file.getName() == materials[i].youtubeVideo.title+"YOUTUBE.txt") {
              fileExists = true;
            }
          } else if ((Object.keys(materials[i])[0] == 'driveFile')) {
            if (file.getName() == materials[i].driveFile.driveFile.title ||  file.getName() == materials[i].title + ".txt") {
              fileExists = true;
            }
          }
        }
        if (fileExists) {
          console.log("File already exists.");
        } else {
          console.log("File hasn't been copied yet. Copying...");
          switch (Object.keys(materials[i])[0]){
            case 'driveFile':
              console.log("It's a drivefile");
              postFolder.createFile(DriveApp.getFileById(materials[i].driveFile.driveFile.id));
              break;

            case 'youtubeVideo':
              console.log("It's a youtube video");
              postFolder.createFile(materials[i].youtubeVideo.title+"YOUTUBE.txt", "Link: " + materials[i].youtubeVideo.alternateLink + materials[i]);
              break;

            case 'link':
              console.log("It's a link");
              postFolder.createFile(materials[i].link.title + "RAW.txt", materials[i]);
              downloadedPage = postFolder.createFile(UrlFetchApp.fetch(materials[i].link.url).getBlob());
              downloadedPage.setName(materials[i].link.title+"DOWNLOADED");
              break;

            case 'form':
              console.log("It's a form");
              postFolder.createFile("FORM.txt", materials[i]);
              break;
            
            default:
              console.log("It's something else!")
              postFolder.createFile("unknown.txt", materials[i]);
          }
        }
      }
    } else {
      var files = postFolder.getFiles();
      var fileExists = false
      while (files.hasNext()) {
        var file = files.next();
        
        if (file.getName() == post.title+"POST.txt") {
          fileExists = true;
        }
      }
      if (fileExists) {
        console.log("'post' file already exists");
      } else {
        console.log(post)
        postFolder.createFile(post.title+"POST.txt", "Description: " + post.description + "\n" + "Posted: " + post.creationTime + "\nLast updated: " + post.updateTime + "\n" + "Posted by: " + Classroom.UserProfiles.get(post.creatorUserId).name.fullName + "\n\n\nData dump:\n" + post + "\n\n" + Classroom.UserProfiles.get(post.creatorUserId));
      }
    }
  } catch (err) {
    console.log(err);
  }
}
/*
function myFunction() {
  // put source folder ID.
  const fromFolder = DriveApp.getFoldersByName("Classroom").next();
  // put destination folder ID.
  const toFolder = DriveApp.getFoldersByName("LBS2020-2023").next();
  // copy the folder content recursively.
  copy(fromFolder, toFolder)
}

function copy(fromFolder, toFolder) {
  // copy files
  var files = fromFolder.getFiles()
  while (files.hasNext()) {
    var file = files.next();
    var newFile = file.makeCopy(toFolder)
    newFile.setName(file.getName())
  }

  // copy folders
  var folders = fromFolder.getFolders()
  while (folders.hasNext()) {
    var folder = folders.next()
    var newFolder = toFolder.createFolder(folder.getName())
    copy(folder, newFolder)
  }
}
*/
