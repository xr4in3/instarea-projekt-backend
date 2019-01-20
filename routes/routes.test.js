const request = require("supertest")
const expect = require("expect")
const app = require("../server").app
const mongoose = require("mongoose")

mongoose.Promise = global.Promise
mongoose.connect(process.env.test, { useNewUrlParser: true })
const Categories = mongoose.model('categories')
let testId = "5c4220764425fa14dcc14b7a"




describe('GET api/categories', function() {
    it('should fetch last one doc of categories', function(done) {
        request(app).get("/api/categories").expect(200).expect((response) => {expect(response.body.length).toBe(1)}).end(done())
        
    })

})

describe('GET api/venues', function() {
    it('should fetch all venues in db', function(done) {
        request(app).get("/api/venues").expect(200).expect((response) => {expect(response.body.length).toBeGreaterThanOrEqualTo(1); expect(response.body[0].name).toBe("Laser Arena")}).end(done())
    })
    
})

describe('GET api/venue/:id', function(){
    

    it('should fetch a venue with given id', function(done)  {
        request(app).get(`/api/venue/${testId}`).expect(200).expect((response) => {expect(response.body.name).toExist()}).end(done())
    })
    it('should not fetch a venue with this id', function(done)  {
        request(app).get(`/api/venue/${testId}2323`).expect(400).expect((response) => {expect(response.body.response).toBe("Invalid ID format!")}).endfunction(done())
    })
  
})

describe('GET api/venues/search' , function() {
    it('should fetch venue by name', function(done)  {
        request(app).get(`/api/venues/search?name=Laser Arena`).expect(200).expect((response) => {expect(response.body.name).toBe("Laser Arena")}).end(done())
        
    })
    it('should fetch venues by rating', function(done) {
        request(app).get(`/api/venues/search?rating__gte=7`).expect(200).expect((response) => {expect(response.body.venues[0].rating).toBeGreaterThanOrEqualTo(7)}).end(done())
        
    });
    
 
   
})

it('should fetch venues by price range', function(done) {
    request(app).get(`/api/venues/search?price__gte=1&price__lte=3`).expect(200).expect((response) => {expect(response.body.venues[0].price).toBeGreaterThanOrEqualTo(1)}).end(done())
    
})
it('should fetch venues by category', function(done) {
    request(app).get(`/api/venues/search?cat__in=Indian Restaurant`).expect(200).expect((response) => {expect(response.body.venues[0].cat).toBe("Indian Restaurant")}).end(done())
    
})
it("should not fetch venues with disallowed Qparams", (done) => {
    request(app).get(`/api/venues/search?likes__gte=5`).expect(400).expect((response) => {expect(response.body.response).toBe("Invalid query params")}).end(done)
})