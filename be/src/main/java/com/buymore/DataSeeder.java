package com.buymore;

import com.buymore.entity.Product;
import com.buymore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (productRepository.count() > 0) return;

        List<Product> products = List.of(
            // Footwear (5 products)
            Product.builder()
                .name("WMX Rubber Zebra Sandal")
                .description("Lightweight rubber sandals with bold zebra-print straps. Perfect for beach and casual wear.")
                .price(new BigDecimal("36.00"))
                .category("Footwear")
                .images(List.of("https://picsum.photos/seed/sandal1/400/400", "https://picsum.photos/seed/sandal1b/400/400"))
                .inventory(12)
                .rating(new BigDecimal("4.5"))
                .tags(List.of("new", "summer"))
                .isFeatured(true)
                .build(),

            Product.builder()
                .name("Urban Runner Pro Sneakers")
                .description("High-performance running sneakers with cushioned soles and breathable mesh upper for all-day comfort.")
                .price(new BigDecimal("89.99"))
                .category("Footwear")
                .images(List.of("https://picsum.photos/seed/sneaker1/400/400", "https://picsum.photos/seed/sneaker1b/400/400"))
                .inventory(25)
                .rating(new BigDecimal("4.8"))
                .tags(List.of("bestseller"))
                .isFeatured(true)
                .build(),

            Product.builder()
                .name("Classic Leather Oxford")
                .description("Timeless leather oxford shoes handcrafted from genuine calfskin. A staple for formal occasions.")
                .price(new BigDecimal("145.00"))
                .category("Footwear")
                .images(List.of("https://picsum.photos/seed/oxford1/400/400"))
                .inventory(3)
                .rating(new BigDecimal("4.6"))
                .tags(List.of("formal", "sale"))
                .isFeatured(false)
                .build(),

            Product.builder()
                .name("Trail Blazer Hiking Boot")
                .description("Waterproof hiking boots with Vibram soles, ankle support, and moisture-wicking lining.")
                .price(new BigDecimal("119.00"))
                .category("Footwear")
                .images(List.of("https://picsum.photos/seed/boot1/400/400", "https://picsum.photos/seed/boot1b/400/400"))
                .inventory(18)
                .rating(new BigDecimal("4.7"))
                .tags(List.of("outdoor"))
                .isFeatured(false)
                .build(),

            Product.builder()
                .name("Slip-On Canvas Espadrille")
                .description("Effortlessly stylish canvas espadrilles with jute trim. Great for summer outings.")
                .price(new BigDecimal("42.00"))
                .category("Footwear")
                .images(List.of("https://picsum.photos/seed/espadrille/400/400"))
                .inventory(0)
                .rating(new BigDecimal("4.2"))
                .tags(List.of("summer"))
                .isFeatured(false)
                .build(),

            // Clothing (5 products)
            Product.builder()
                .name("Slim Fit Chino Pants")
                .description("Modern slim-fit chinos crafted from stretch cotton blend. Versatile for work and weekend.")
                .price(new BigDecimal("59.99"))
                .category("Clothing")
                .images(List.of("https://picsum.photos/seed/chino1/400/400", "https://picsum.photos/seed/chino1b/400/400"))
                .inventory(40)
                .rating(new BigDecimal("4.4"))
                .tags(List.of("sale"))
                .isFeatured(false)
                .build(),

            Product.builder()
                .name("Relaxed Linen Shirt")
                .description("Breezy linen shirt in a relaxed fit, perfect for warm weather. Machine washable.")
                .price(new BigDecimal("48.00"))
                .category("Clothing")
                .images(List.of("https://picsum.photos/seed/linen1/400/400"))
                .inventory(30)
                .rating(new BigDecimal("4.3"))
                .tags(List.of("new", "summer"))
                .isFeatured(true)
                .build(),

            Product.builder()
                .name("Merino Wool Crew Neck Sweater")
                .description("Luxuriously soft merino wool sweater with ribbed cuffs and hem. Ideal for layering.")
                .price(new BigDecimal("95.00"))
                .category("Clothing")
                .images(List.of("https://picsum.photos/seed/sweater1/400/400", "https://picsum.photos/seed/sweater1b/400/400"))
                .inventory(2)
                .rating(new BigDecimal("4.9"))
                .tags(List.of("premium"))
                .isFeatured(true)
                .build(),

            Product.builder()
                .name("Athletic Zip-Up Hoodie")
                .description("Moisture-wicking zip-up hoodie with kangaroo pocket and adjustable drawstring hood.")
                .price(new BigDecimal("65.00"))
                .category("Clothing")
                .images(List.of("https://picsum.photos/seed/hoodie1/400/400"))
                .inventory(50)
                .rating(new BigDecimal("4.5"))
                .tags(List.of("bestseller"))
                .isFeatured(false)
                .build(),

            Product.builder()
                .name("Floral Wrap Midi Dress")
                .description("Flowy wrap-style midi dress in a vibrant floral print. Features a flattering V-neckline.")
                .price(new BigDecimal("72.00"))
                .category("Clothing")
                .images(List.of("https://picsum.photos/seed/dress1/400/400", "https://picsum.photos/seed/dress1b/400/400"))
                .inventory(15)
                .rating(new BigDecimal("4.6"))
                .tags(List.of("new"))
                .isFeatured(false)
                .build(),

            // Accessories (3 products)
            Product.builder()
                .name("Polarized Aviator Sunglasses")
                .description("Lightweight polarized aviator sunglasses with UV400 protection and spring-hinged temples.")
                .price(new BigDecimal("55.00"))
                .category("Accessories")
                .images(List.of("https://picsum.photos/seed/sunglass/400/400"))
                .inventory(22)
                .rating(new BigDecimal("4.7"))
                .tags(List.of("summer", "bestseller"))
                .isFeatured(true)
                .build(),

            Product.builder()
                .name("Minimalist Leather Belt")
                .description("Full-grain leather dress belt with a polished silver buckle. Available in black and tan.")
                .price(new BigDecimal("38.00"))
                .category("Accessories")
                .images(List.of("https://picsum.photos/seed/belt1/400/400"))
                .inventory(1)
                .rating(new BigDecimal("4.4"))
                .tags(List.of("sale"))
                .isFeatured(false)
                .build(),

            Product.builder()
                .name("Cashmere Knit Beanie")
                .description("Warm cashmere-blend beanie in a classic ribbed pattern. Softness meets cold-weather style.")
                .price(new BigDecimal("29.00"))
                .category("Accessories")
                .images(List.of("https://picsum.photos/seed/beanie/400/400"))
                .inventory(35)
                .rating(new BigDecimal("4.3"))
                .tags(List.of("new"))
                .isFeatured(false)
                .build(),

            // Bags (3 products)
            Product.builder()
                .name("Canvas Weekender Duffel")
                .description("Sturdy waxed canvas weekender bag with leather handles and removable shoulder strap.")
                .price(new BigDecimal("110.00"))
                .category("Bags")
                .images(List.of("https://picsum.photos/seed/duffel/400/400", "https://picsum.photos/seed/duffelb/400/400"))
                .inventory(10)
                .rating(new BigDecimal("4.8"))
                .tags(List.of("premium", "bestseller"))
                .isFeatured(true)
                .build(),

            Product.builder()
                .name("Slim Tech Backpack")
                .description("Sleek 20L backpack with padded laptop sleeve (up to 15\"), USB charging port, and water-resistant shell.")
                .price(new BigDecimal("79.00"))
                .category("Bags")
                .images(List.of("https://picsum.photos/seed/backpack/400/400"))
                .inventory(20)
                .rating(new BigDecimal("4.6"))
                .tags(List.of("new"))
                .isFeatured(false)
                .build(),

            Product.builder()
                .name("Leather Crossbody Mini Bag")
                .description("Compact genuine leather crossbody bag with adjustable strap and magnetic clasp closure.")
                .price(new BigDecimal("65.00"))
                .category("Bags")
                .images(List.of("https://picsum.photos/seed/crossbody/400/400", "https://picsum.photos/seed/crossbodyb/400/400"))
                .inventory(0)
                .rating(new BigDecimal("4.5"))
                .tags(List.of("sale"))
                .isFeatured(false)
                .build()
        );

        productRepository.saveAll(products);
        log.info("Seeded {} products", products.size());
    }
}
