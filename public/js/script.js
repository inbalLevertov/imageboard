(function() {
    function scrollToTop(scrollDuration) {
        var scrollStep = -window.scrollY / (scrollDuration / 15),
            scrollInterval = setInterval(function() {
                if (window.scrollY != 0) {
                    window.scrollBy(0, scrollStep);
                } else clearInterval(scrollInterval);
            }, 15);
    }

    function getImage(x) {
        var me = x;
        axios
            .get(`/image/${me.id}`)
            .then(function(response) {
                console.log(
                    "response.data[0].nextId from get /image: ",
                    response.data[0].nextId
                );
                me.chosenimage = response.data[0];
                if (!me.chosenimage) {
                    // console.log("if statment works in watch");
                    me.$emit("message");
                }
                console.log("me.chosenimage in watch: ", me.chosenimage);
            })
            .then(function() {
                var self = me;
                axios.get(`/pastComments/${self.id}`).then(function(resp) {
                    self.comments = resp.data;
                    scrollToTop(800);
                });
            })
            .catch(function(err) {
                console.log("error in axios.get /images in watch: ", err);
            });
    }
    /////
    Vue.component("my-first-component", {
        template: "#my-component",
        props: ["id"],
        data: function() {
            return {
                comments: "",
                chosenimage: "",
                user: "",
                comment: "",
                nextId: "",
                prevId: ""
            };
        },
        mounted: function() {
            getImage(this);
        },
        watch: {
            id: function() {
                console.log("the id has changed!!", this.id);
                getImage(this);
            }
        },
        methods: {
            submitClick: function(e) {
                e.preventDefault();
                console.log("submitClick fn is working: ");
                // console.log("comment: ", this.comment, "user: ", this.user);
                var comments = {
                    user: this.user,
                    comment: this.comment,
                    imageId: this.id
                };
                var me = this;
                axios
                    .post("/uploadComments", comments)
                    .then(function(resp) {
                        me.comments.unshift(resp.data.rows[0]);
                        me.user = "";
                        me.comment = "";
                    })
                    .catch(function(err) {
                        console.log("error in post /uploadComments: ", err);
                    });
            },
            closeImage: function() {
                this.$emit("message");
            }
            // deleteImage: function() {
            //     var chosenimage = this.chosenimage;
            //     this.$emit('delete', chosenimage);
            // }
        }
    });

    // closes Vue component
    new Vue({
        el: "#main",
        data: {
            button: true,
            id: location.hash.slice(1),
            images: [],
            title: "",
            description: "",
            username: "",
            file: null
        }, //data ends
        mounted: function() {
            var me = this;

            axios
                .get("/images")
                .then(function(response) {
                    me.images = response.data;
                })
                .catch(function(err) {
                    console.log("err in get /images: ", err);
                });
            addEventListener("hashchange", function() {
                me.id = location.hash.slice(1);
            });
        },
        methods: {
            handleClick: function(e) {
                e.preventDefault();
                console.log("handle click fn after submitting file is working");
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                var me = this;
                axios
                    .post("/upload", formData)
                    .then(function(resp) {
                        var imageObj = resp.data.rows[0];
                        me.images.unshift(imageObj);
                        me.title = "";
                        me.description = "";
                        me.username = "";
                        // me.file = null;
                    })
                    .catch(function(err) {
                        console.log("err in POST /upload: ", err);
                    });
            },
            handleChange: function(e) {
                console.log("handleChange is running");
                // console.log("file: ", e.target.files[0]);
                this.file = e.target.files[0];
                // console.log("this after adding the file: ", this);
            },
            clickMore: function() {
                var ids = this.images.map(function(x) {
                    return x.id;
                });

                var smallestId = Math.min.apply(null, ids);
                if (smallestId < 10) {
                    this.button = false;
                }
                var me = this;
                axios.get(`/more/${smallestId}`).then(function(resp) {
                    console.log("resp.data from get /more: ", resp.data);
                    me.images.push.apply(me.images, resp.data);
                    // me.images.push(...resp.data);
                });
            },
            handleMessage: function() {
                // if (this.id === 0) {
                //     return (this.id = 1);
                // }
                this.id = null;
                // location.hash = "";
                history.replaceState(null, null, " ");
                console.log("message received!!");
            },
            deleteImage: function(e) {
                e.stopPropagation();
                console.log("e.target.id: ", e.target.id);
                var id = e.target.id;
                axios
                    .get(`/delete/${id}`)
                    .then(function(resp) {
                        location.reload();
                        console.log("resp from get /delete: ", resp);
                    })
                    .catch(function(err) {
                        console.log("err in deleteImage: ", err);
                    });
                // handelDelete: function() {
                //     axios.get(`/delete/`${chosenimage}).then(function(resp) {
                //         console.log("resp from get /delete: ", resp);
                //
                //     })
            }
        }
    });
})();
